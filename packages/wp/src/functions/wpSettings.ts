export async function updateWpSettings(preferences: Preferences): Promise<{
	success: boolean;
	res?: unknown;
	err?: unknown;
}> {
	const wpSettings = new window.wp.api.models.Settings();
	const wpOptions = await wpSettings.fetch();
	const oldPreferences = wpOptions?.core_framework_main;

	if (oldPreferences === preferences) {
		return new Promise((resolve) =>
			resolve({
				success: true,
			}),
		);
	}

	const model = new window.wp.api.models.Settings({
		core_framework_main: preferences,
	});

	return new Promise((resolve, reject) => {
		model
			.save()
			.then((res: unknown) =>
				resolve({
					success: true,
					res,
				}),
			)
			.catch((err: unknown) =>
				resolve({
					success: false,
					err,
				}),
			);
	});
}
