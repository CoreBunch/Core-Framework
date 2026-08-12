printf 'Bumping version\n'

current_version=$1
if [ -z "$current_version" ]
then
    echo "No version provided"
    exit 1
fi

next_version=$2
if [ -z "$next_version" ]
then
    echo "No next version provided"
    exit 1
fi

paths=(
    "packages/blocks/src/theme-toggle/block.json"
    "packages/core/src/constants/version.ts"
    "packages/gutenberg/package.json"
    "packages/gutenberg/plugin.php"
    "packages/wp/gutenberg-blocks/theme-toggle/block.json"
    "packages/wp/composer.json"
    "packages/wp/core-framework.php"
    "packages/wp/package.json"
    "packages/wp/readme.txt"
    "packages/www/package.json"
)

for path in "${paths[@]}"
do
    if [ -f "$path" ]
    then
        if [[ "$path" == *package.json ]] || [[ "$path" == *composer.json ]]; then
            sed -i '' -e "s/\"version\": \"$current_version\"/\"version\": \"$next_version\"/g" "$path"
        else
            sed -i '' -e "s/$current_version/$next_version/g" "$path"
        fi
        echo "Bumped $path"
    else
        echo "File not found: $path"
    fi
done

echo "Bumped version to $next_version"
