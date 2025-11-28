from django.contrib import admin
from .models import CustomUser,JobPost,Course,VocationalSchool,Review

admin.site.register(CustomUser)
admin.site.register(JobPost)
admin.site.register(VocationalSchool)
admin.site.register(Course)
admin.site.register(Review)

# Register your models here.
        