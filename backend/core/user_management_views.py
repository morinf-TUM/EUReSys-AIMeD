from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

@method_decorator(csrf_exempt, name='dispatch')
class UserManagementView(View):
    """
    User Management API - Complete control over user database
    
    Endpoints:
    - GET /api/users/ - List all users
    - DELETE /api/users/<email>/ - Delete user by email
    - DELETE /api/users/all/ - Delete ALL users (dangerous!)
    - POST /api/users/reset-password/ - Reset user password
    """
    
    def get(self, request):
        """List all users in the system"""
        try:
            users = User.objects.all().values('id', 'username', 'email', 'is_active', 'is_superuser', 'date_joined')
            return JsonResponse({
                'success': True,
                'data': {
                    'users': list(users),
                    'count': users.count()
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to list users: {str(e)}'
            }, status=500)
    
    def delete(self, request, email=None):
        """Delete user by email or delete all users"""
        try:
            if email and email.lower() == 'all':
                # Delete ALL users - dangerous operation
                count = User.objects.count()
                User.objects.all().delete()
                return JsonResponse({
                    'success': True,
                    'data': {
                        'message': f'Deleted ALL {count} users from the system',
                        'deleted_count': count
                    }
                })
            elif email:
                # Delete specific user by email
                users = User.objects.filter(email=email)
                if users.exists():
                    user = users.first()
                    username = user.username
                    user.delete()
                    return JsonResponse({
                        'success': True,
                        'data': {
                            'message': f'User {username} ({email}) deleted successfully',
                            'deleted_user': {'username': username, 'email': email}
                        }
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'error': f'User with email {email} not found'
                    }, status=404)
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Email parameter required for deletion'
                }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to delete user: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(View):
    """Reset user password to a known value"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            new_password = data.get('password', 'password123')
            
            if not email:
                return JsonResponse({
                    'success': False,
                    'error': 'Email is required'
                }, status=400)
            
            users = User.objects.filter(email=email)
            if users.exists():
                user = users.first()
                user.set_password(new_password)
                user.save()
                return JsonResponse({
                    'success': True,
                    'data': {
                        'message': f'Password reset for {email}',
                        'username': user.username,
                        'email': email,
                        'new_password': new_password
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'User with email {email} not found'
                }, status=404)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to reset password: {str(e)}'
            }, status=500)