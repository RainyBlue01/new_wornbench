#!/bin/bash
source_dir="/e/JYYS_DSP/05_workgrup/new_wornbench"
remote_build_dir="/home/nginx/html"

function build() {
    cd $source_dir
    npm run build
}

function send() {
    local dist_dir="${source_dir}/dist"
    if [ -d "$dist_dir" ]; then
        echo "Found dist directory, sending to remote..."
        ssh root@172.17.2.122 'bash -s' << EOF
            cd /
            # Backup existing dist if exists
            if [ -d ${remote_build_dir}/wornbench ]; then
                rm -rf ${remote_build_dir}/wornbench_bak
                mv ${remote_build_dir}/wornbench ${remote_build_dir}/wornbench_bak
            fi
            exit
EOF
        scp -r $dist_dir root@172.17.2.122:${remote_build_dir}/
        ssh root@172.17.2.122 'bash -s' << EOF
            mv ${remote_build_dir}/dist ${remote_build_dir}/wornbench
            cp -f ${remote_build_dir}/wornbench_bak/config.js_bak ${remote_build_dir}/wornbench/config.js
            docker restart my-nginx
            exit
EOF
        echo "Dist directory sent successfully."
    else
        echo "Error: dist directory not found. Please run build first."
        exit 1
    fi
}

# build
send