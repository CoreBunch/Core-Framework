#!/usr/bin/env bash

set -euo pipefail

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_VERSION="$(sed -nE 's/^[[:space:]]*"version": "([^"]+)",?$/\1/p' "$REPOSITORY_ROOT/packages/wp/package.json" | head -n 1)"
PLUGIN_ZIP="${1:-$REPOSITORY_ROOT/.tmp/release/core-framework-$PLUGIN_VERSION.zip}"

WORDPRESS_IMAGE="${WP_E2E_WORDPRESS_IMAGE:-wordpress:php8.2-apache}"
CLI_IMAGE="${WP_E2E_CLI_IMAGE:-wordpress:cli-php8.2}"
DATABASE_IMAGE="${WP_E2E_DATABASE_IMAGE:-mariadb:11.4}"
RUN_ID="core-framework-e2e-$$"
NETWORK_NAME="$RUN_ID"
DATABASE_CONTAINER="$RUN_ID-db"
WORDPRESS_CONTAINER="$RUN_ID-wp"
WORDPRESS_VOLUME="$RUN_ID-wp-data"
COOKIE_FILE="$(mktemp)"

cleanup() {
	docker rm -f "$WORDPRESS_CONTAINER" "$DATABASE_CONTAINER" >/dev/null 2>&1 || true
	docker volume rm "$WORDPRESS_VOLUME" >/dev/null 2>&1 || true
	docker network rm "$NETWORK_NAME" >/dev/null 2>&1 || true
	rm -f "$COOKIE_FILE"
}

trap cleanup EXIT INT TERM

if ! command -v docker >/dev/null 2>&1; then
	echo "Docker is required for the WordPress end-to-end test." >&2
	exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
	echo "curl is required for the WordPress end-to-end test." >&2
	exit 1
fi

if [[ ! -f "$PLUGIN_ZIP" ]]; then
	echo "WordPress release ZIP not found: $PLUGIN_ZIP" >&2
	exit 1
fi

ARTIFACT_DIRECTORY="$(cd "$(dirname "$PLUGIN_ZIP")" && pwd)"
ARTIFACT_FILENAME="$(basename "$PLUGIN_ZIP")"

wp_cli() {
	docker run --rm \
		--network "$NETWORK_NAME" \
		--volumes-from "$WORDPRESS_CONTAINER" \
		--volume "$ARTIFACT_DIRECTORY:/artifacts:ro" \
		--user 33:33 \
		--env WORDPRESS_DB_HOST="$DATABASE_CONTAINER:3306" \
		--env WORDPRESS_DB_USER=wordpress \
		--env WORDPRESS_DB_PASSWORD=wordpress \
		--env WORDPRESS_DB_NAME=wordpress \
		"$CLI_IMAGE" wp --path=/var/www/html "$@"
}

wait_for_command() {
	local description="$1"
	shift

	for _attempt in $(seq 1 90); do
		if "$@" >/dev/null 2>&1; then
			return 0
		fi
		sleep 2
	done

	echo "Timed out waiting for $description." >&2
	return 1
}

echo "Starting disposable WordPress environment..."
docker network create "$NETWORK_NAME" >/dev/null
docker volume create "$WORDPRESS_VOLUME" >/dev/null

docker run --detach \
	--name "$DATABASE_CONTAINER" \
	--network "$NETWORK_NAME" \
	--env MARIADB_DATABASE=wordpress \
	--env MARIADB_USER=wordpress \
	--env MARIADB_PASSWORD=wordpress \
	--env MARIADB_ROOT_PASSWORD=wordpress-root \
	"$DATABASE_IMAGE" >/dev/null

docker run --detach \
	--name "$WORDPRESS_CONTAINER" \
	--network "$NETWORK_NAME" \
	--publish 127.0.0.1::80 \
	--volume "$WORDPRESS_VOLUME:/var/www/html" \
	--env WORDPRESS_DB_HOST="$DATABASE_CONTAINER:3306" \
	--env WORDPRESS_DB_USER=wordpress \
	--env WORDPRESS_DB_PASSWORD=wordpress \
	--env WORDPRESS_DB_NAME=wordpress \
	"$WORDPRESS_IMAGE" >/dev/null

wait_for_command "MariaDB" docker exec "$DATABASE_CONTAINER" mariadb-admin ping --user=root --password=wordpress-root
wait_for_command "WordPress files" docker exec "$WORDPRESS_CONTAINER" test -f /var/www/html/wp-config.php

wp_cli config set WP_DEBUG true --raw --quiet
wp_cli config set WP_DEBUG_LOG true --raw --quiet
wp_cli config set WP_DEBUG_DISPLAY false --raw --quiet
wait_for_command "the WordPress database connection" wp_cli db check

HOST_PORT="$(docker port "$WORDPRESS_CONTAINER" 80/tcp | sed -E 's/.*:([0-9]+)$/\1/' | head -n 1)"
SITE_URL="http://127.0.0.1:$HOST_PORT"

wp_cli core install \
	--url="$SITE_URL" \
	--title="Core Framework E2E" \
	--admin_user=admin \
	--admin_password=core-framework-e2e-password \
	--admin_email=e2e@example.test \
	--skip-email

for option_name in \
	core_framework_free_license \
	core_framework_bricks_license_key \
	core_framework_oxygen_license_key \
	core_framework_figma_license_key; do
	wp_cli option add "$option_name" retired-commercial-value --quiet
done

wp_cli plugin install "/artifacts/$ARTIFACT_FILENAME" --activate

[[ "$(wp_cli plugin get core-framework --field=status)" == "active" ]]
[[ "$(wp_cli plugin get core-framework --field=version)" == "$PLUGIN_VERSION" ]]
[[ "$(wp_cli option get core_framework_db_version)" == "1.3" ]]

PRESET_TABLE="$(wp_cli db query "SHOW TABLES LIKE 'wp_core_framework_presets';" --skip-column-names)"
[[ "$PRESET_TABLE" == "wp_core_framework_presets" ]]

wp_cli eval '
$path = \CoreFramework\StylesheetStorage::get_path();
if (!is_file($path)) {
	WP_CLI::error("Generated stylesheet was not created during activation.");
}
WP_CLI::success("Generated stylesheet exists in the uploads directory.");
'

curl --fail --silent --show-error --cookie-jar "$COOKIE_FILE" "$SITE_URL/wp-login.php" >/dev/null
curl --fail --silent --show-error --location \
	--cookie "$COOKIE_FILE" \
	--cookie-jar "$COOKIE_FILE" \
	--data-urlencode "log=admin" \
	--data-urlencode "pwd=core-framework-e2e-password" \
	--data-urlencode "wp-submit=Log In" \
	--data-urlencode "redirect_to=$SITE_URL/wp-admin/admin.php?page=core-framework" \
	--data-urlencode "testcookie=1" \
	"$SITE_URL/wp-login.php" >/dev/null

ADMIN_HTML="$(curl --fail --silent --show-error --cookie "$COOKIE_FILE" "$SITE_URL/wp-admin/admin.php?page=core-framework")"
grep -q 'id="core-framework-init"' <<<"$ADMIN_HTML"
grep -q '/wp-content/plugins/core-framework/dist/' <<<"$ADMIN_HTML"

for option_name in \
	core_framework_free_license \
	core_framework_bricks_license_key \
	core_framework_oxygen_license_key \
	core_framework_figma_license_key; do
	if wp_cli option get "$option_name" >/dev/null 2>&1; then
		echo "Retired commercial option was not removed: $option_name" >&2
		exit 1
	fi
done

IFS='|' read -r JAVASCRIPT_ASSET CSS_ASSET <<<"$(wp_cli eval '
$manifest = json_decode(file_get_contents(WP_PLUGIN_DIR . "/core-framework/dist/.vite/manifest.json"), true);
$entry = $manifest["main.tsx"] ?? null;
if (!$entry || empty($entry["file"]) || empty($entry["css"][0])) {
	WP_CLI::error("The Vite entry is missing from the release manifest.");
}
echo $entry["file"] . "|" . $entry["css"][0];
')"

curl --fail --silent --show-error "$SITE_URL/wp-content/plugins/core-framework/dist/$JAVASCRIPT_ASSET" >/dev/null
curl --fail --silent --show-error "$SITE_URL/wp-content/plugins/core-framework/dist/$CSS_ASSET" >/dev/null

docker exec "$WORDPRESS_CONTAINER" grep -q '@font-face' "/var/www/html/wp-content/plugins/core-framework/dist/$CSS_ASSET"
docker exec "$WORDPRESS_CONTAINER" grep -q 'Inter Variable' "/var/www/html/wp-content/plugins/core-framework/dist/$CSS_ASSET"
if docker exec "$WORDPRESS_CONTAINER" grep -Eq 'fonts\.(googleapis|gstatic)\.com' "/var/www/html/wp-content/plugins/core-framework/dist/$CSS_ASSET"; then
	echo "The WordPress editor CSS still makes a remote Google Fonts request." >&2
	exit 1
fi

FONT_FILE="$(docker exec "$WORDPRESS_CONTAINER" find /var/www/html/wp-content/plugins/core-framework/dist -maxdepth 1 -name '*.woff2' -print -quit)"
[[ -n "$FONT_FILE" ]]
curl --fail --silent --show-error "$SITE_URL${FONT_FILE#/var/www/html}" >/dev/null

wp_cli eval '
wp_set_current_user(1);
$api = new \CoreFramework\App\Rest\AllPoints();
add_action("rest_api_init", array($api, "register_routes"));

$unauthorized = rest_do_request(new WP_REST_Request("GET", "/core-framework/v2/get-builders"));
if ($unauthorized->get_status() < 400) {
	WP_CLI::error("Protected REST route accepted a request without a nonce.");
}

$create = new WP_REST_Request("POST", "/core-framework/v2/api-key");
$create->set_header("X-WP-Nonce", wp_create_nonce("wp_rest"));
$created = rest_do_request($create);
$created_data = $created->get_data();
$key = $created_data["key"] ?? "";
if ($created->is_error() || empty($created_data["success"]) || strlen($key) < 24) {
	WP_CLI::error("Could not create a Figma connection key through REST.");
}

$preset = new WP_REST_Request("GET", "/core-framework/v2/preset");
$preset->set_header("X-Core-Framework-Key", $key);
$preset_response = rest_do_request($preset);
$preset_data = $preset_response->get_data();
if ($preset_response->is_error() || empty($preset_data["success"])) {
	WP_CLI::error("The Figma connection key could not access the preset route.");
}

$delete = new WP_REST_Request("DELETE", "/core-framework/v2/api-key");
$delete->set_header("X-WP-Nonce", wp_create_nonce("wp_rest"));
$deleted = rest_do_request($delete);
if ($deleted->is_error() || get_option("core_framework_api_key", "") !== "") {
	WP_CLI::error("Could not delete the Figma connection key through REST.");
}

WP_CLI::success("REST authorization and Figma connection-key lifecycle passed.");
'

wp_cli plugin deactivate core-framework --quiet
[[ "$(wp_cli plugin get core-framework --field=status)" == "inactive" ]]
wp_cli plugin activate core-framework --quiet
[[ "$(wp_cli plugin get core-framework --field=status)" == "active" ]]

curl --fail --silent --show-error "$SITE_URL/" >/dev/null
REST_INDEX="$(curl --fail --silent --show-error "$SITE_URL/?rest_route=/")"
grep -q 'core-framework' <<<"$REST_INDEX"

if docker exec "$WORDPRESS_CONTAINER" test -f /var/www/html/wp-content/debug.log; then
	if docker exec "$WORDPRESS_CONTAINER" grep -Eqi 'PHP (Fatal|Parse) error|Uncaught (Error|Exception)' /var/www/html/wp-content/debug.log; then
		docker exec "$WORDPRESS_CONTAINER" tail -n 100 /var/www/html/wp-content/debug.log >&2
		exit 1
	fi
fi

echo "WordPress E2E passed: WordPress $(wp_cli core version), PHP $(wp_cli eval 'echo PHP_VERSION;'), Core Framework $PLUGIN_VERSION"
