import { describe, expect, test } from "bun:test";
import { readLocalProject, saveLocalProject } from "../main/localProjectStorage";
import { createPluginDataStore } from "./helpers/pluginDataStore";
import { DEFAULT_PRESET, getMinimalPreset } from "../../core/src/data/presets";

const KEY = "cf_plugin_project_local";
const largePreset = { id: "local-project", name: "Custom project", data: "x".repeat(250_000) };

describe("local project persistence", () => {
	test("round-trips both bundled starting presets under Figma's actual entry limit", () => {
		for (const preset of [DEFAULT_PRESET, getMinimalPreset()]) {
			const store = createPluginDataStore();
			expect(Buffer.byteLength(JSON.stringify(preset))).toBeGreaterThan(100_000);
			saveLocalProject(store, preset);
			expect(readLocalProject(store)).toEqual(preset);
		}
	});

	test("reopens a project larger than Figma's per-entry limit", () => {
		const store = createPluginDataStore();
		expect(() => store.setPluginData(KEY, JSON.stringify(largePreset))).toThrow("100 kB");
		saveLocalProject(store, largePreset);
		// Reopen using only persisted entries, with no editor/session state.
		const reopened = createPluginDataStore();
		for (const [key, value] of store.entries) reopened.setPluginData(key, value);
		expect(readLocalProject(reopened)).toEqual(largePreset);
	});

	test("preserves Unicode across chunk boundaries without browser encoding APIs", () => {
		const store = createPluginDataStore();
		const preset = { id: "unicode", data: "Ž漢😀".repeat(40_000) };
		saveLocalProject(store, preset);
		// Simulate Figma encoding each entry independently as UTF-8.
		for (const [key, value] of store.entries) store.entries.set(key, Buffer.from(value).toString("utf8"));
		expect(readLocalProject(store)).toEqual(preset);
	});

	test("loads legacy projects and migrates them on the next save", () => {
		const store = createPluginDataStore();
		const legacy = { id: "old", name: "Existing local project" };
		store.setPluginData(KEY, JSON.stringify(legacy));
		expect(readLocalProject(store)).toEqual(legacy);
		saveLocalProject(store, { ...legacy, ...largePreset });
		expect(readLocalProject(store)).toEqual({ ...legacy, ...largePreset });
	});

	for (const failure of ["chunk", "manifest"]) {
		test(`keeps the previous complete save if the next ${failure} write fails`, () => {
			const store = createPluginDataStore();
			saveLocalProject(store, largePreset);
			store.failWritesWhen(
				(key, value) => Boolean(value) && (failure === "manifest" ? key === KEY : key.endsWith("_b_1")),
			);
			expect(() => saveLocalProject(store, { ...largePreset, name: "Unsaved changes" })).toThrow();
			expect(readLocalProject(store)).toEqual(largePreset);
			store.failWritesWhen();
			saveLocalProject(store, { ...largePreset, name: "Retried" });
			expect(readLocalProject(store)).toEqual({ ...largePreset, name: "Retried" });
		});
	}

	test("keeps a legacy save when migration fails", () => {
		const store = createPluginDataStore();
		store.setPluginData(KEY, JSON.stringify({ id: "legacy" }));
		store.failWritesWhen((key) => key.endsWith("_a_1"));
		expect(() => saveLocalProject(store, largePreset)).toThrow();
		expect(readLocalProject(store)).toEqual({ id: "legacy" });
	});

	test("removes unused chunks when a project shrinks, leaving other plugin data alone", () => {
		const store = createPluginDataStore();
		store.setPluginData("other_setting", "keep");
		saveLocalProject(store, largePreset);
		saveLocalProject(store, { id: "smaller" });
		saveLocalProject(store, { id: "smallest" });
		expect(readLocalProject(store)).toEqual({ id: "smallest" });
		expect(store.entries.size).toBe(3); // manifest, one chunk, unrelated setting
		expect(store.getPluginData("other_setting")).toBe("keep");
	});

	test("distinguishes an absent project from missing or invalid persisted data", () => {
		const store = createPluginDataStore();
		expect(readLocalProject(store)).toBeNull();
		saveLocalProject(store, largePreset);
		store.entries.delete(`${KEY}_a_1`);
		expect(() => readLocalProject(store)).toThrow("incomplete");
		store.entries.set(KEY, '{"format":"core-framework-project-chunks","version":99}');
		expect(() => readLocalProject(store)).toThrow("metadata");
	});
});
