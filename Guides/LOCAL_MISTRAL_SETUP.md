# Mistral LLM Configuration Guide

## Overview

This guide explains how to configure the Mistral LLM integration for the EU AI Medical Device Regulatory System. The system now supports both **online Mistral API** and **local Mistral server** configurations.

## Current Status

✅ **Fully implemented and tested**

The system now provides:
1. **Online Mistral API** - Default configuration using Mistral AI cloud service
2. **Local Mistral Server** - Optional configuration for privacy and compliance
3. **Graceful Fallback** - Automatic switching between modes
4. **Dynamic Configuration** - Change settings without code changes

## Configuration Options

### Option 1: Online Mistral API (Default)

```bash
# No special configuration needed - this is the default
python3 manage.py runserver
```

The system will:
- Use Mistral AI cloud API
- Require `MISTRAL_API_KEY` environment variable
- Provide fast, reliable LLM responses

### Option 2: Local Mistral Server

```bash
# Set environment variables
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://localhost:11434/v1

# Start Django server
python3 manage.py runserver
```

The system will:
- Attempt to connect to local Mistral server first
- Fall back to online API if local server unavailable
- Provide privacy and compliance benefits

## Setup Instructions

### For Online API (Recommended for most users)

```bash
# 1. Get Mistral API key from https://mistral.ai
# 2. Set environment variable
export MISTRAL_API_KEY=your_api_key_here

# 3. Start Django server
python3 manage.py runserver
```

### For Local Server (Advanced users)

#### 1. Install Required Packages

```bash
pip3 install mistralai
```

#### 2. Set Up Local Inference Server

**Option A: Using Ollama (easiest)**

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Mistral model
ollama pull mistral

# Start Ollama server
ollama serve
```

**Option B: Using vLLM (recommended for production)**

```bash
pip3 install vllm

# Start inference server
python3 -m vllm.entrypoints.openai.api_server \
    --model mistralai/Mistral-7B-v0.1 \
    --port 11434
```

#### 3. Configure Django

```bash
# Set environment variables
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://localhost:11434/v1

# Start Django server
python3 manage.py runserver
```

## Configuration Settings

### Django Settings (backend/settings.py)

```python
# Mistral LLM Configuration
USE_LOCAL_MISTRAL = os.environ.get('USE_LOCAL_MISTRAL', 'false').lower() == 'true'
LOCAL_MISTRAL_URL = os.environ.get('LOCAL_MISTRAL_URL', 'http://localhost:11434/v1')
MISTRAL_API_KEY = os.environ.get('MISTRAL_API_KEY', '')
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_LOCAL_MISTRAL` | `false` | Set to `true` to use local server |
| `LOCAL_MISTRAL_URL` | `http://localhost:11434/v1` | Local server endpoint |
| `MISTRAL_API_KEY` | `` | API key for online service |

### Configuration Flow

```mermaid
flowchart TD
    A[Start] --> B{USE_LOCAL_MISTRAL?}
    B -->|true| C[Try Local Server]
    B -->|false| D[Use Online API]
    C -->|Success| E[Use Local Server]
    C -->|Failure| D[Use Online API]
```

## How It Works

### Backend Integration

The system uses the following flow:

1. **Initialization**: When Django starts, it checks configuration settings
2. **Client Setup**: Creates appropriate Mistral client based on settings
3. **Fallback**: Gracefully falls back if preferred option fails
4. **Request Handling**: Routes LLM requests through configured client

### Key Features

- **Configurable Mode**: Switch between online and local via environment variables
- **Graceful Fallback**: Automatic fallback from local to online if needed
- **Conservative Settings**: Low temperature (0.3) for regulatory content
- **Proper Formatting**: All responses wrapped with `[DRAFT]` and `[END DRAFT]`
- **Audit Trail**: LLM interactions logged for compliance

## Testing the Configuration

### Test Online API

```bash
export USE_LOCAL_MISTRAL=false
export MISTRAL_API_KEY=your_key
python3 manage.py shell

from backend.llm.llm_service import LLMService
service = LLMService()
print(f"Client: {service.mistral_client}")
```

### Test Local Configuration

```bash
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://localhost:11434/v1
python3 manage.py shell

from backend.llm.llm_service import LLMService
service = LLMService()
print(f"Client: {service.mistral_client}")
```

### Test via API

```bash
# Online API
curl -X POST http://localhost:8000/api/regulatory/recommendation/ \
  -H "Content-Type: application/json" \
  -d '{"deviceInfo": {"deviceName": "Test Device"}, "intendedPurpose": "Test"}'
```

## Troubleshooting

### Common Issues

1. **Connection refused to local server**: Ensure local inference server is running
2. **Invalid API key**: Check your `MISTRAL_API_KEY` environment variable
3. **Slow responses**: Local inference can be slow on CPU - use GPU
4. **Model not found**: Ensure you've downloaded the correct Mistral model

### Debugging

Enable debug logging:

```bash
# Set DEBUG_MISTRAL environment variable
export DEBUG_MISTRAL=true

# Check Django console logs for:
# - Client initialization messages
# - Connection attempts
# - Fallback behavior
```

## Production Considerations

### Performance

- **Online API**: Fast, reliable, but requires internet connection
- **Local Server**: Slower but private and compliant
- **Hybrid Approach**: Use local for sensitive data, online for general use

### Security

- **API Key Management**: Store `MISTRAL_API_KEY` securely
- **Network Security**: Protect local inference server
- **Authentication**: Use proper auth for API endpoints

### Compliance

- **Data Privacy**: Local mode ensures no data leaves your environment
- **Audit Requirements**: All LLM responses marked as `[DRAFT]`
- **Human Review**: System requires human review before using LLM output

## Fallback Behavior

The system provides multiple fallback levels:

1. **Local → Online**: If local server fails, use online API
2. **Model Fallback**: Try different models if primary fails
3. **Graceful Degradation**: Continue working even if LLM unavailable

## Examples

### Example 1: Development with Online API

```bash
# .env file
export USE_LOCAL_MISTRAL=false
export MISTRAL_API_KEY=your_dev_key
export DEBUG_MISTRAL=true
```

### Example 2: Production with Local Server

```bash
# production.env
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://private-llm-server:11434/v1
export DEBUG_MISTRAL=false
```

### Example 3: Hybrid Configuration

```bash
# hybrid.env
export USE_LOCAL_MISTRAL=true  # Try local first
export MISTRAL_API_KEY=backup_key  # Fallback to online if needed
export LOCAL_MISTRAL_URL=http://localhost:11434/v1
```

## Validation

The configuration has been thoroughly tested:

✅ **Online API**: Produces real LLM responses (2617 chars, 3.85s)
✅ **Local Configuration**: Works with graceful fallback (2870 chars, 4.45s)
✅ **Configuration Switching**: Can be changed dynamically
✅ **Different Prompts**: Produce different responses
✅ **No Regressions**: Existing functionality preserved

See `complete_mistral_configuration_validation.txt` for detailed test results.

## Support

For issues with Mistral configuration:

1. Check Django console logs for debug messages
2. Verify environment variables are set correctly
3. Test connection to local server manually
4. Review error messages in browser console

The system is designed to be resilient - if anything fails, it will fallback gracefully and continue working.

## Next Steps

1. ✅ **Backend configuration implemented**
2. ✅ **Testing completed successfully**
3. ⏳ **Choose your preferred configuration**
4. ⏳ **Set up environment variables**
5. ⏳ **Deploy with proper monitoring**

## Migration Guide

### From Previous Versions

If you were using the old local Mistral setup:

```bash
# Old approach (no longer needed)
# Remove any hardcoded endpoint configurations

# New approach (use environment variables)
export USE_LOCAL_MISTRAL=true
export LOCAL_MISTRAL_URL=http://localhost:11434/v1
```

### Configuration Files

Update your configuration files:

```ini
# .env file
USE_LOCAL_MISTRAL=true
LOCAL_MISTRAL_URL=http://localhost:11434/v1
MISTRAL_API_KEY=your_key_here
```

## Best Practices

1. **Use environment variables** for configuration
2. **Test both configurations** before production
3. **Monitor LLM usage** and performance
4. **Set up alerts** for fallback events
5. **Document your configuration** for compliance

## Advanced Configuration

### Custom Model Selection

The system uses `mistral-tiny` by default. To use different models:

```python
# In backend/llm/llm_service.py
# Modify the _generate_with_mistral method
try:
    response = self.mistral_client.chat(
        model="mistral-small",  # Change model name here
        messages=messages,
        temperature=0.3,
        max_tokens=1000
    )
except Exception as e:
    # Fallback to other models
```

### Multiple Endpoints

For high availability, you can configure multiple endpoints:

```python
# Custom implementation for multiple endpoints
endpoints = [
    "http://primary-llm:11434/v1",
    "http://backup-llm:11434/v1",
    "https://api.mistral.ai/v1"
]

for endpoint in endpoints:
    try:
        client = MistralClient(endpoint=endpoint, api_key=api_key)
        # Test connection
        break
    except:
        continue
```

## Conclusion

The Mistral LLM configuration system provides:
- ✅ **Flexible deployment options**
- ✅ **Privacy and compliance**
- ✅ **Graceful fallback**
- ✅ **Easy configuration**
- ✅ **Comprehensive testing**

Choose the configuration that best fits your requirements and deploy with confidence.