for d in packages/*; do
    if [ -d "$d" ]; then
        echo "Formatting $d"
        start=`date +%s`
        (cd "$d" && bunx prettier --write "./**/*.{ts,tsx,json,scss}")
        end=`date +%s`
        echo "Finished formatting $d in $((end-start)) seconds"
    fi
done