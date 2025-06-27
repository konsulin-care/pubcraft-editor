#!/bin/sh
set -e

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

# Error handling function
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Validation function for environment variables
validate_env_vars() {
    local REQUIRED_VARS="VITE_ORCID_CLIENT_ID VITE_GITHUB_CLIENT_ID"
    local MISSING_VARS=""

    for var in $REQUIRED_VARS; do
        if [ -z "$(eval "echo \$$var")" ]; then
            MISSING_VARS="$MISSING_VARS $var"
        fi
    done

    if [ -n "$MISSING_VARS" ]; then
        log "WARNING: Missing environment variables:$MISSING_VARS"
        return 1
    fi
    return 0
}

# Sanitize input to prevent potential script injection
sanitize_input() {
    # More aggressive sanitization
    echo "$1" | sed -E 's/[;&|`()\$\{\}]//g' | tr -d '\n\r\t' | sed 's/"/\\"/g'
}

# Generate env.js with enhanced security and error handling
generate_env_js() {
    local OUTPUT_FILE="/app/dist/env.js"
    local TEMP_FILE="/app/dist/env.js.tmp"

    # Predefined list of allowed environment variables with stricter validation
    local ALLOWED_VARS="VITE_ORCID_CLIENT_ID VITE_ORCID_REDIRECT_URI VITE_GITHUB_CLIENT_ID VITE_GITHUB_REDIRECT_URI VITE_APP_NAME VITE_APP_VERSION VITE_DEBUG_MODE"

    # Create temporary file with strict permissions
    touch "$TEMP_FILE"
    chmod 600 "$TEMP_FILE"

    # Start writing env.js with enhanced security
    {
        echo "// Dynamic Environment Configuration"
        echo "// WARNING: This file is generated at runtime. Do not modify manually."
        echo "window.ENV = window.ENV || {};"
        echo "window.ENV.errors = [];"
        echo "window.ENV.warnings = [];"
    } > "$TEMP_FILE"

    # Process each allowed variable with stricter checks
    for var in $ALLOWED_VARS; do
        value=$(eval "echo \$$var")
        if [ -n "$value" ]; then
            # Enhanced sanitization
            safe_value=$(sanitize_input "$value")
            
            # Write to temp file with error tracking and additional validation
            echo "try { 
    const sanitizedValue = '$safe_value'.trim();
    if (sanitizedValue.length > 0) {
        window.ENV['$var'] = sanitizedValue;
    } else {
        window.ENV.warnings.push('Empty value for $var');
    }
} catch(e) { 
    window.ENV.errors.push('Failed to set $var: ' + e.message); 
}" >> "$TEMP_FILE"
        else
            # Log missing but allowed variables
            echo "window.ENV.warnings.push('Missing environment variable: $var');" >> "$TEMP_FILE"
        fi
    done

    # Add comprehensive error and warning logging mechanism
    {
        echo "if (window.ENV.errors.length > 0) {"
        echo "  console.error('Environment Configuration Errors:', window.ENV.errors);"
        echo "}"
        echo "if (window.ENV.warnings.length > 0) {"
        echo "  console.warn('Environment Configuration Warnings:', window.ENV.warnings);"
        echo "}"
    } >> "$TEMP_FILE"

    # Atomically replace the env.js file
    mv "$TEMP_FILE" "$OUTPUT_FILE"
    
    log "Generated env.js with configuration"
}

# Inject env.js script tag if not present
inject_env_script() {
    local HTML_FILE="/app/dist/index.html"
    
    if ! grep -q "env.js" "$HTML_FILE"; then
        # Insert env.js script before other scripts with a more specific selector
        sed -i '/<script type="module" src="\/src\/main.tsx">/i\    <script src="/env.js" crossorigin="anonymous"></script>' "$HTML_FILE"
        log "Injected env.js script tag into index.html"
    fi
}

# Main execution with error handling
main() {
    # Validate environment variables (non-fatal)
    validate_env_vars || log "Some environment variables are missing"

    # Generate dynamic configuration
    generate_env_js

    # Inject script tag
    inject_env_script

    # Execute original CMD
    log "Starting application"
    exec "$@"
}

# Trap errors and log them
trap 'handle_error "Command failed with exit code $?"' ERR

# Run main function
main "$@"
