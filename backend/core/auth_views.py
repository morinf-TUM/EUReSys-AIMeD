from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views import View
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from datetime import datetime, timedelta
import uuid

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            company = data.get('company', '')
            
            # Validate required fields
            if not username or not email or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Username, email, and password are required'
                }, status=400)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Username already exists'
                }, status=400)
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Email already exists'
                }, status=400)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Create user session data
            user_session = {
                'token': str(uuid.uuid4()),
                'userId': str(user.id),
                'username': user.username,
                'email': user.email,
                'permissions': ['user'],  # Default permissions
                'expiresAt': (datetime.now() + timedelta(days=1)).isoformat()
            }
            
            return JsonResponse({
                'success': True,
                'data': user_session
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Registration failed: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            # Validate required fields
            if not email or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Email and password are required'
                }, status=400)
            
            # Authenticate user - try both email and username
            user = authenticate(request, username=email, password=password)
            
            if user is None:
                # Try to find user by email and authenticate with username
                try:
                    from django.contrib.auth.models import User
                    user_model = User.objects.get(email=email)
                    user = authenticate(request, username=user_model.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if user is None:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=401)
            
            # Create user session data
            user_session = {
                'token': str(uuid.uuid4()),
                'userId': str(user.id),
                'username': user.username,
                'email': user.email,
                'permissions': ['user'],  # Default permissions, can be extended
                'expiresAt': (datetime.now() + timedelta(days=1)).isoformat()
            }
            
            return JsonResponse({
                'success': True,
                'data': user_session
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Login failed: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        try:
            # In a real implementation, you would invalidate the session/token here
            # For now, just return success
            return JsonResponse({
                'success': True,
                'data': {'message': 'Logged out successfully'}
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Logout failed: {str(e)}'
            }, status=500)

class CSRFTokenView(View):
    def get(self, request):
        return JsonResponse({'csrfToken': get_token(request)})