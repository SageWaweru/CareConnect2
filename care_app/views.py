from django.shortcuts import render
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .models import CustomUser, CaretakerProfile, Review, Message, Reply, JobPost, JobApplication, VocationalSchool, Course, Enrollment
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser,IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserSerializer, ReviewSerializer,CaretakerProfileSerializer, JobApplicationSerializer, JobPostSerializer, VocationalSchoolSerializer, CourseSerializer, EnrollmentSerializer, ChatMessageSerializer, ReplySerializer
from rest_framework import viewsets, permissions, generics
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.mail import send_mail
from django.http import HttpResponse
from django.conf import settings
import os
import traceback
import logging

logger = logging.getLogger(__name__)


def index(request):
    index_path = os.path.join(settings.BASE_DIR, "CareConnect_frontend", "dist", "index.html")
    
    if request.path.startswith("/api/"):
        return HttpResponse("Not found", status=404)

    if not os.path.exists(index_path):
        return HttpResponse("Frontend build missing. Please rebuild the frontend.", status=500)

    with open(index_path, "r") as f:
        return HttpResponse(f.read())
# ...existing code...


User = get_user_model()

import sys


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()  # use the serializer.create() path in [serializers.py](http://_vscodecontentref_/3)
            return Response({"message": "User registered successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        except Exception:
            logger.exception("Registration error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response({"message": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'role': getattr(user, 'role', None),
                    'is_superuser': user.is_superuser,
                    'user_id': user.id,
                    'username': user.username,
                }, status=status.HTTP_200_OK)

            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Login error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class UserListView(APIView):
    #  permission_classes = [IsAdminUser]  

     def get(self, request, *args, **kwargs):
        users = CustomUser.objects.all() 
        serializer = UserSerializer(users, many=True)  
        return Response(serializer.data)  


class UserDetailView(APIView):
    permission_classes = []  

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)  
        serializer = UserSerializer(user)  
        return Response(serializer.data, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user 
        serializer = UserSerializer(user)  
        return Response(serializer.data)
    
class UpdateUserDetailsView(APIView):
    def put(self, request, id, *args, **kwargs):
        try:
            user = CustomUser.objects.get(id=id)

            serializer = UserSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {'message': 'User details updated successfully'},
                    status=status.HTTP_200_OK
                )
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        

class IsCaretaker(permissions.BasePermission):
    def has_permission(self, request, view):
        # ensure anonymous users don't raise AttributeError
        return getattr(request.user, "is_authenticated", False) and getattr(request.user, "role", None) == "caretaker"

class CaretakerProfileViewSet(viewsets.ModelViewSet):
    queryset = CaretakerProfile.objects.all()
    serializer_class = CaretakerProfileSerializer
    filter_backends = [DjangoFilterBackend]
    # average_rating is a read-only/computed field on the serializer — don't put it in filterset_fields
    filterset_fields = ['skills', 'availability']
# ...existing code...    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsCaretaker()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        profile_picture = self.request.data.get('profile_picture')
        if profile_picture and isinstance(profile_picture, str):  
                serializer.save(user=self.request.user, profile_picture=profile_picture)
        else:
         serializer.save(user=self.request.user)

class CaretakerProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        profile = get_object_or_404(CaretakerProfile, user=user_id)
        serializer = CaretakerProfileSerializer(profile)
        print("Response Data:", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK) 
    
    def put(self, request, user_id):
        profile = get_object_or_404(CaretakerProfile, user=user_id)
        profile_picture = self.request.data.get('profile_picture')
        print("Request Data:", request.data) 
        
        if 'profile_picture' in request.data:
            print("New profile_picture:", request.data['profile_picture'])
        
        serializer = CaretakerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  
            print("Response Data:", serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CaretakerProfileByIdView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, id):
        profile = get_object_or_404(CaretakerProfile, id=id)
        serializer = CaretakerProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CaretakerProfileListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = CaretakerProfile.objects.all()
        serializer = CaretakerProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        caretaker_id = self.kwargs['caretaker_id']
        return Review.objects.filter(caretaker_id=caretaker_id)

    def perform_create(self, serializer):
        caretaker_id = self.kwargs['caretaker_id']
        caretaker = CaretakerProfile.objects.get(id=caretaker_id)
        
        if not self.request.user.role == "customer":  
            raise ValidationError("Only customers can review caretakers.")

        if Review.objects.filter(user=self.request.user, caretaker=caretaker).exists():
            raise ValidationError("You have already reviewed this caretaker.")
        
        serializer.save(user=self.request.user, caretaker=caretaker)

class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        sender_id = kwargs.get('sender_id')
        if sender_id:
            conversation = Message.objects.filter(
                Q(sender=request.user, receiver_id=sender_id) |
                Q(sender_id=sender_id, receiver=request.user)
            ).select_related('sender', 'receiver').prefetch_related('replies').order_by('timestamp')
        else:
            conversation = Message.objects.filter(
                Q(sender=request.user) | Q(receiver=request.user)
            ).select_related('sender', 'receiver').prefetch_related('replies').order_by('timestamp')

        serializer = ChatMessageSerializer(conversation, many=True)
        return Response({"all_messages": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        receiver_id = request.data.get("receiver")
        content = request.data.get("content")
        reply_to_id = request.data.get("reply_to") 

        if not receiver_id or not content:
            return Response({"error": "Receiver and content are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            CustomUser = get_user_model()
            receiver = CustomUser.objects.get(id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        if reply_to_id:
            try:
                reply_to = Reply.objects.get(id=reply_to_id)
                reply = Reply.objects.create(
                    message=reply_to.message,  
                    sender=request.user,
                    receiver=receiver,
                    content=content,
                    reply_to=reply_to  
                )
                serializer = ReplySerializer(reply)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Reply.DoesNotExist:
                try:
                    original_message = Message.objects.get(id=reply_to_id)
                    reply = Reply.objects.create(
                        message=original_message,
                        sender=request.user,
                        receiver=receiver,
                        content=content,
                        reply_to=None  
                    )
                    serializer = ReplySerializer(reply)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except Message.DoesNotExist:
                    return Response({"error": "Message or Reply not found."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            message = Message.objects.create(
                sender=request.user,
                receiver=receiver,
                content=content
            )
            serializer = ChatMessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChatMessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id, *args, **kwargs):
        """
        Get all messages between the logged-in user and the user with user_id.
        """
        conversation = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).select_related('sender', 'receiver').prefetch_related('replies').order_by('timestamp')

        serializer = ChatMessageSerializer(conversation, many=True)
        return Response({"conversation": serializer.data}, status=status.HTTP_200_OK)
    
class ReplyAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        # Optional: restrict who can reply
        if request.user != message.sender and request.user != message.receiver:
            return Response({"error": "You cannot reply to this message."}, status=status.HTTP_403_FORBIDDEN)

        reply_content = request.data.get("content")
        if not reply_content:
            return Response({"error": "Reply content is required."}, status=status.HTTP_400_BAD_REQUEST)

        reply_to_id = request.data.get("reply_to")  # optional, for nested replies
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Reply.objects.get(id=reply_to_id)
            except Reply.DoesNotExist:
                return Response({"error": "Reply target not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create the reply
        reply = Reply.objects.create(
            message=message,
            sender=request.user,
            receiver=message.sender if message.sender != request.user else message.receiver,
            content=reply_content,
            reply_to=reply_to
        )

        serializer = ReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MarkReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        # Mark all messages from this user to the logged-in user as read
        Message.objects.filter(sender_id=user_id, receiver=request.user, read=False).update(read=True)
        return Response({"status": "messages marked as read"}, status=status.HTTP_200_OK)
    
class JobPostListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        jobs = JobPost.objects.all().order_by("-created_at")
        serializer = JobPostSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(customer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, job_id=None):
        try:
            job = JobPost.objects.get(id=job_id) 
        except JobPost.DoesNotExist:
            return Response({"detail": "Job post not found."}, status=status.HTTP_404_NOT_FOUND)

        if job.customer != request.user:
            return Response({"detail": "You are not authorized to update this job post."}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobPostSerializer(job, data=request.data, partial=True)  
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, job_id=None):
        try:
            job = JobPost.objects.get(id=job_id) 
        except JobPost.DoesNotExist:
            return Response({"detail": "Job post not found."}, status=status.HTTP_404_NOT_FOUND)

        if job.customer != request.user:
            return Response({"detail": "You are not authorized to delete this job post."}, status=status.HTTP_403_FORBIDDEN)
        JobApplication.objects.filter(job=job).delete()

        job.delete()

        return Response({"detail": "Job post and its applications have been deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class JobApplicationListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        role = getattr(request.user, "role", None)
        if role == 'customer' and getattr(request.user, "is_authenticated", False):
            job_posts = JobPost.objects.filter(customer=request.user)
            applications = JobApplication.objects.filter(job__in=job_posts)
        elif getattr(request.user, "is_authenticated", False):
            applications = JobApplication.objects.filter(caretaker=request.user)
        else:
            # anonymous users get empty list rather than causing an AttributeError
            applications = JobApplication.objects.none()
        
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not getattr(request.user, "is_authenticated", False):
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        job_id = request.data.get('job')
        if JobApplication.objects.filter(caretaker=request.user, job_id=job_id).exists():
            return Response(
                {"detail": "You have already applied for this job. Please check your previous application or apply for another job."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(caretaker=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobApplicationDetailUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, application_id):
        try:
            application = JobApplication.objects.get(id=application_id)
        except JobApplication.DoesNotExist:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if application.job.customer != request.user:
            return Response(
                {"detail": "Unauthorized to update this application."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get("status")
        if new_status not in ["Pending", "Hired", "Rejected"]:
            return Response(
                {"detail": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = new_status
        application.save()

        caretaker_email = application.caretaker.email
        caretaker_name = (
            application.caretaker.get_full_name()
            if hasattr(application.caretaker, "get_full_name")
            else str(application.caretaker)
        )

        if new_status == "Hired":
            application.job.status = "In Progress"
            application.job.save()

            subject = "Job Application Approved"
            message = f"""Dear {caretaker_name},

Congratulations! We are delighted to inform you that your application for the caretaker position for the job "{application.job.title}" has been approved.

Your skills and dedication have distinguished you from other applicants, and we look forward to welcoming you to our team. Further details regarding your role, next steps, and onboarding process will be communicated to you shortly.

Thank you for your interest in this opportunity.

Best regards,
{application.job.customer.get_full_name() if hasattr(application.job.customer, 'get_full_name') else str(application.job.customer)}
"""
            send_mail(
                subject=subject,
                message=message,
                from_email="admin@careconnect.com",
                recipient_list=[caretaker_email],
                fail_silently=False,
            )

        elif new_status == "Rejected":
            subject = "Job Application Update"
            message = f"""Dear {caretaker_name},

Thank you for your interest in the caretaker position for the job "{application.job.title}". After careful consideration, we regret to inform you that your application has not been successful at this time.

We appreciate the effort you put into your application and encourage you to apply for future opportunities that match your skills and experience.

We wish you every success in your future endeavors.

Sincerely,
{application.job.customer.get_full_name() if hasattr(application.job.customer, 'get_full_name') else str(application.job.customer)}
"""
            send_mail(
                subject=subject,
                message=message,
                from_email="admin@careconnect.com",
                recipient_list=[caretaker_email],
                fail_silently=False,
            )

        return Response(
            {"message": f"Application status updated to {new_status}."},
            status=status.HTTP_200_OK
        )

class VocationalSchoolView(APIView):
    permission_classes = []

    def post(self, request):
        if not getattr(request.user, "is_authenticated", False) or getattr(request.user, "role", None) != "vocational_school":
            return Response({"error": "Only vocational school managers can create a school"}, status=status.HTTP_403_FORBIDDEN)
        
        print("Authenticated User:", request.user) 
        print("User Role:", getattr(request.user, "role", None))

        files = request.FILES if request.FILES else None

        data = request.data.dict() if hasattr(request.data, "dict") else request.data
        data["manager"] = request.user.id 

        serializer = VocationalSchoolSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# ...existing code...


class VocationalSchoolListView(APIView):
    permission_classes = []

    def get(self, request):
        schools = VocationalSchool.objects.all()
        serializer = VocationalSchoolSerializer(schools, many=True)
        return Response(serializer.data)

class CourseView(APIView):
    permission_classes = []

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "vocational_school":
            return Response(
                {"error": "Only vocational school managers can add courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            school = request.user.school  
        except VocationalSchool.DoesNotExist:
            return Response({"error": "School profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(school=school)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != "vocational_school" or course.school != request.user.school:
            return Response({"error": "You are not authorized to edit this course"}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, course_id):
        if request.user.role != "vocational_school":
            return Response({"error": "Only school managers can update course status"}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id, school=request.user.school)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        course.status = "closed" if course.status == "open" else "open"
        course.save()

        return Response({"message": f"Course is now {course.status}"}, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != "vocational_school" or course.school != request.user.school:
            return Response({"error": "You are not authorized to delete this course"}, status=status.HTTP_403_FORBIDDEN)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SchoolCoursesView(APIView):
    def get(self, request, school_id):
        try:
            school = VocationalSchool.objects.get(id=school_id)
        except VocationalSchool.DoesNotExist:
            return Response({"error": "School not found"}, status=status.HTTP_404_NOT_FOUND)

        courses = Course.objects.filter(school=school)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class EnrollmentAPIView(APIView):
    # require authentication for enrollments
    permission_classes = [IsAuthenticated]  

    def post(self, request, course_id, *args, **kwargs):
        user = request.user 
        course = get_object_or_404(Course, id=course_id)

        if Enrollment.objects.filter(caretaker=user, course=course).exists():
            return Response({"detail": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)
        
        if course.status == "closed":
            return Response({"detail": "This course is currently closed for enrollment."}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name')
        email = request.data.get('email')
        age = request.data.get('age')

        if not name or not email or not age:
            return Response({"detail": "Name, email, and age are required."}, status=status.HTTP_400_BAD_REQUEST)


        enrollment = Enrollment.objects.create(
            caretaker=user,
            course=course,
            name=name,
            email=email,
            age=age
        )


        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
# ...existing code...

class SchoolEnrollmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        if request.user.role != "vocational_school":
            return Response({"error": "Only school managers can view enrollments"}, status=status.HTTP_403_FORBIDDEN)

        try:
            school = VocationalSchool.objects.get(id=school_id)
        except VocationalSchool.DoesNotExist:
            return Response({"error": "School not found"}, status=status.HTTP_404_NOT_FOUND)

        enrollments = Enrollment.objects.filter(course__school=school)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApproveEnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, enrollment_id):
        if getattr(request.user, "role", None) != "vocational_school":
            return Response(
                {"error": "Only school managers can approve enrollments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment = get_object_or_404(
            Enrollment, id=enrollment_id, course__school=request.user.school
        )

        enrollment.approved = True
        enrollment.save()

        plain_message = f"""Dear {enrollment.name},

        We are delighted to inform you that your enrollment for the course "{enrollment.course.title}" at {enrollment.course.school.name} has been approved.

        At {enrollment.course.school.name}, we are committed to providing an outstanding academic experience. You will soon receive further details regarding your course schedule, orientation, and additional pertinent information.

        Thank you for choosing {enrollment.course.school.name} as your educational partner.

        Sincerely,
        The Admissions Team at {enrollment.course.school.name}
        """

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear {enrollment.name},</p>
            <p>
            We are delighted to inform you that your enrollment for the course 
            <strong>"{enrollment.course.title}"</strong> at <strong>{enrollment.course.school.name}</strong> has been approved.
            </p>
            <p>
            At {enrollment.course.school.name}, we are committed to providing an outstanding academic experience. 
            You will soon receive further details regarding your course schedule, orientation, and additional pertinent information.
            </p>
            <p>
            Thank you for choosing {enrollment.course.school.name} as your educational partner.
            </p>
            <p>
            Sincerely,<br>
            The Admissions Team at {enrollment.course.school.name}
            </p>
        </body>
        </html>
        """

        send_mail(
            subject="Enrollment Approved",
            message=plain_message,  
            from_email="admin@careconnect.com",
            recipient_list=[enrollment.email],
            fail_silently=False,
            html_message=html_message,  
        )

        return Response({"message": "Enrollment approved"}, status=status.HTTP_200_OK)


class RejectEnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, enrollment_id):
        if getattr(request.user, "role", None) != "vocational_school":
            return Response(
                {"error": "Only school managers can reject enrollments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment = get_object_or_404(
            Enrollment, id=enrollment_id, course__school=request.user.school
        )

        student_name = enrollment.name
        course_title = enrollment.course.title
        school_name = enrollment.course.school.name
        student_email = enrollment.email

        enrollment.delete()

        plain_message = f"""Dear {student_name},

        Thank you for your interest in the course "{course_title}" at {school_name}.
        After careful consideration, we regret to inform you that your enrollment application has not been approved at this time.

        If you have any questions or need further clarification, please contact our admissions office.

        Sincerely,
        The Admissions Team at {school_name}
        """

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear {student_name},</p>
            <p>
            Thank you for your interest in the course <strong>"{course_title}"</strong> at <strong>{school_name}</strong>.
            After careful consideration, we regret to inform you that your enrollment application has not been approved at this time.
            </p>
            <p>
            We understand that this decision may be disappointing. If you have any questions or need further clarification,
            please do not hesitate to contact our admissions office.
            </p>
            <p>
            We appreciate your interest and encourage you to explore other opportunities.
            </p>
            <p>Sincerely,<br>
            The Admissions Team at {school_name}
            </p>
        </body>
        </html>
        """

        send_mail(
            subject="Enrollment Rejected",
            message=plain_message,  
            from_email="admin@careconnect.com",
            recipient_list=[student_email],
            fail_silently=False,
            html_message=html_message,  
        )

        return Response(
            {"message": "Enrollment rejected and removed"},
            status=status.HTTP_200_OK
        )


class AdminUserListView(APIView):
    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)  
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AdminUserDetailView(APIView):
    def get(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCaretakerProfileListCreateView(APIView):
    def get(self, request):
        profiles = CaretakerProfile.objects.all()
        serializer = CaretakerProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CaretakerProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response(CaretakerProfileSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCaretakerProfileDetailView(APIView):
    def get(self, request, pk):
        try:
            profile = CaretakerProfile.objects.get(pk=pk)
        except CaretakerProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CaretakerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            profile = CaretakerProfile.objects.get(pk=pk)
        except CaretakerProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CaretakerProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            profile = CaretakerProfile.objects.get(pk=pk)
        except CaretakerProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminJobPostListCreateAPIView(APIView):
    def get(self, request):
        jobs = JobPost.objects.all()
        serializer = JobPostSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class JobPostStatusUpdateAPIView(APIView):
    def patch(self, request, pk=None):
        try:
            job = JobPost.objects.get(id=pk)
        except JobPost.DoesNotExist:
            return Response({"detail": "Job post not found."}, status=status.HTTP_404_NOT_FOUND)


        new_status = request.data.get("status")

        if not new_status:
            return Response({"detail": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        job.save()
        return Response(JobPostSerializer(job).data, status=status.HTTP_200_OK)

class JobPostDetailView(APIView):
    def get(self, request, pk):
        try:
            job = JobPost.objects.get(pk=pk)
        except JobPost.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = JobPostSerializer(job)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            job = JobPost.objects.get(pk=pk)
        except JobPost.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = JobPostSerializer(job, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            job = JobPost.objects.get(pk=pk)
        except JobPost.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminJobApplicationListCreateAPIView(APIView):
    def get(self, request):
        applications = JobApplication.objects.all()
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save()
            return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminJobApplicationDetailUpdateAPIView(APIView):
    def get(self, request, job_id):
            applications = JobApplication.objects.filter(job__id=job_id)  # Filter by job ID
            serializer = JobApplicationSerializer(applications, many=True)
            return Response(serializer.data)
    
    def put(self, request, pk):
        try:
            application = JobApplication.objects.get(pk=pk)
        except JobApplication.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = JobApplicationSerializer(application, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            application = JobApplication.objects.get(pk=pk)
        except JobApplication.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        application.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminReviewListView(APIView):
    def get(self, request, *args, **kwargs):
        caretaker_id = request.query_params.get('caretaker_id', None)
        
        if caretaker_id:
            reviews = Review.objects.filter(caretaker_id=caretaker_id)
        else:
            reviews = Review.objects.all()
        
        serializer = ReviewSerializer(reviews, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminSchoolListView(APIView):
    def get(self, request):
        schools = VocationalSchool.objects.all()
        serializer = VocationalSchoolSerializer(schools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminEnrollmentListView(APIView):
    def get(self, request):
        enrollments = Enrollment.objects.all()
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
