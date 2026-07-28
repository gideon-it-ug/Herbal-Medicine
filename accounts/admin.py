from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'


class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_staff', 'is_active')
    list_select_related = ('profile',)

    def get_role(self, obj):
        return obj.profile.get_role_display() if hasattr(obj, 'profile') else '—'
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'profile__role'


# Re-register User with the custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_role', 'is_approved', 'created_at')
    list_filter = ('role', 'is_approved', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    list_editable = ('is_approved',)

    def get_role(self, obj):
        return obj.get_role_display()
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'role'
