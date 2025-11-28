from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . views import (
    UserRegistrationView,
    UserLoginView,
    UserListView,
    UserDetailView,
    CurrentUserView,
    UpdateUserDetailsView,
    CaretakerProfileViewSet,
    CaretakerProfileDetailView,
    CaretakerProfileByIdView,
    ReviewListCreateView,
    ChatMessageListView,
    ReplyAPIView,
    JobApplicationListCreateAPIView,
    JobPostListCreateAPIView,
    JobApplicationDetailUpdateAPIView,
    VocationalSchoolView, 
    CourseView, 
    ApproveEnrollmentView,
    RejectEnrollmentView,
    EnrollmentAPIView,
    VocationalSchoolListView,
    SchoolCoursesView,
    SchoolEnrollmentsView,
    AdminCaretakerProfileDetailView,
    AdminCaretakerProfileListCreateView,
    AdminJobApplicationDetailUpdateAPIView,
    AdminJobApplicationListCreateAPIView,
    AdminJobPostListCreateAPIView,
    AdminUserDetailView,
    AdminUserListView,
    JobPostDetailView,
    AdminReviewListView,
    JobPostStatusUpdateAPIView,
    AdminEnrollmentListView,
    AdminSchoolListView,
    ChatMessageDetailView,
    MarkReadAPIView,
)

router = DefaultRouter()
router.register(r'caretaker-profiles', CaretakerProfileViewSet, basename='caretaker-profile')


urlpatterns = [
    path('', include([
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User registration and login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    
    # User management
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='specific-user'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'), 
    path('update-user/<int:id>/', UpdateUserDetailsView.as_view(), name='update_user'),
    
    # Caretaker
    path('caretaker-profiles/user/<int:user_id>/', CaretakerProfileDetailView.as_view(), name='caretaker-profile-detail'),
    path("caretaker-profiles/<int:id>/", CaretakerProfileByIdView.as_view(), name="caretaker-profile-by-id"),
    
    # Review path
    path('caretaker/<int:caretaker_id>/reviews/', ReviewListCreateView.as_view(), name='caretaker-reviews'),
    
    # Messages
    path('messages/', ChatMessageListView.as_view(), name='chat-messages'),    
    path('messages/<int:message_id>/replies/', ReplyAPIView.as_view(), name='message-replies'),
    path("messages/<int:user_id>/", ChatMessageDetailView.as_view(), name="chat-messag-detail"),
    path('messages/<int:user_id>/mark-read/', MarkReadAPIView.as_view(), name='mark-read'),


    # Job Post URLs
    path('jobs/', JobPostListCreateAPIView.as_view(), name='job-list-create'),
    path('jobs/<int:job_id>/', JobPostListCreateAPIView.as_view(), name='job-update'),

    # Job Application URLs
    path('applications/', JobApplicationListCreateAPIView.as_view(), name='application-list-create'),
    path('jobs/<int:job_id>/applications/', JobApplicationListCreateAPIView.as_view(), name='job-applications'),
    path('applications/<int:application_id>/update/', JobApplicationDetailUpdateAPIView.as_view(), name='application-update'),

    path("school/", VocationalSchoolView.as_view(), name="school"),
    path("schools/", VocationalSchoolListView.as_view(), name="schools"),
    path("courses/", CourseView.as_view(), name="courses"),
    path("courses/school/<int:school_id>/", SchoolCoursesView.as_view(), name="school-courses"),
    path("courses/<int:pk>/", CourseView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/toggle-status/", CourseView.as_view(), name="toggle-course-status"),
    path('courses/<int:course_id>/enroll/', EnrollmentAPIView.as_view(), name='enroll-course'),
    path("enrollments/school/<int:school_id>/", SchoolEnrollmentsView.as_view(), name="school-enrollments"),
    path("approve-enrollment/<int:enrollment_id>/", ApproveEnrollmentView.as_view(), name="approve-enrollment"),
    path("reject-enrollment/<int:enrollment_id>/", RejectEnrollmentView.as_view(), name="reject-enrollment"),
 
    # Admin URLs
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserListView.as_view(), name='admin-user'),
    path('admin/users/<int:pk>/toggle-status/', AdminUserListView.as_view(), name='admin-user-status'),
    path('admin/users/detail/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    
    path('admin/caretaker-profiles/', AdminCaretakerProfileListCreateView.as_view(), name='admin-caretaker-profile-list-create'),
    path('admin/caretaker-profiles/<int:pk>/', AdminCaretakerProfileDetailView.as_view(), name='admin-caretaker-profile-detail'),

    path('admin/reviews/', AdminReviewListView.as_view(), name='caretaker-reviews'),

    path('admin/job-posts/', AdminJobPostListCreateAPIView.as_view(), name='admin-job-post-list-create'),
    path('admin/job-posts/<int:pk>/', JobPostDetailView.as_view(), name='admin-job-post-detail'),
    path('admin/jobs/<int:pk>/', JobPostStatusUpdateAPIView.as_view(), name='admin-job-detail'),

    path('admin/job-applications/', AdminJobApplicationListCreateAPIView.as_view(), name='admin-job-application-list-create'),
    path('admin/job-applications/<int:job_id>/', AdminJobApplicationDetailUpdateAPIView.as_view(), name='admin-job-application-detail-update'),
    path('admin/job-applications/delete/<int:pk>/', AdminJobApplicationDetailUpdateAPIView.as_view(), name='admin-job-application-delete'),

    path('admin/schools/', AdminSchoolListView.as_view(), name='admin-schools'),
    path('admin/enrollments/', AdminEnrollmentListView.as_view(), name='admin-enrollments'),

    path('', include(router.urls)),
  
   ])),
]
