#!/bin/bash


download_url="http://mayorx.xyz/Media/EngWeb2024/project/dump.sql"

# check if the database is already downloaded
if [ -f /datasets/dump.sql ]; then
    echo "Dump file found"
else
    echo "Dump file not found, downloading..."
    wget -O /datasets/dump.sql $download_url
fi

