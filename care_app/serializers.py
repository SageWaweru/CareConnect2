from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomUser, CaretakerProfile, Review, Message, Reply, JobApplication, JobPost, VocationalSchool, Course, Enrollment

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        try:
           print("🔍 Raw validated_data:", validated_data)
           role = validated_data.pop('role')  # Safely extract role
           username = validated_data.get('username')
           email = validated_data.get('email')
           password = validated_data.get('password')
           # Try creating with role via manager (some custom managers require role param)
           try:
               user = User.objects.create_user(
                   username=username,
                   email=email,
                   password=password,
                   role=role
               )
           except TypeError:
               # Manager didn't accept role — create instance and set password
               user = User(username=username, email=email, role=role)
               user.set_password(password)
               user.save()
           print("✅ Final saved user with role:", user)
           return user
        except Exception as e:
            import traceback
            print("❌ Exception in serializer.create():", e)
            traceback.print_exc()
            raise e  # re-raise to make sure it bubbles up into your view
# ...existing code... 
    
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_superuser']

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        
        instance.save()    
        return instance
    

class CaretakerProfileSerializer(serializers.ModelSerializer):
    average_rating = serializers.ReadOnlyField()
    profile_picture = serializers.SerializerMethodField()

    def get_profile_picture(self, obj):
        try:
            return obj.profile_picture.url if obj.profile_picture else None
        except AttributeError:
            return None

    class Meta:
        model = CaretakerProfile
        fields = '__all__'
        
class ReviewSerializer(serializers.ModelSerializer):
    caretaker_name = serializers.CharField(source="caretaker.name", read_only=True)
    reviewer_name = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Review
        fields = ['id','user','caretaker', 'reviewer_name', 'caretaker_name', 'rating', 'review_text', 'created_at']
        
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = '__all__'

    def create(self, validated_data):
        message = validated_data['message']
        
        reply_to_message = validated_data.get('reply_to', None)
        
        reply = Reply.objects.create(
            message=message,
            sender=validated_data['sender'],
            receiver=validated_data['receiver'],
            content=validated_data['content'],
            reply_to=reply_to_message  
        )
        
        return reply

class ChatMessageSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(many=True, read_only=True)  

    class Meta:
        model = Message
        fields = '__all__'
    def get_replies(self, obj):
        replies = Reply.objects.filter(message=obj)
        return ReplySerializer(replies, many=True).data  

class JobPostSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)
    customer_id = serializers.ReadOnlyField(source='customer.id')

    class Meta:
        model = JobPost
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    caretaker = serializers.StringRelatedField(read_only=True)
    job = serializers.PrimaryKeyRelatedField(queryset=JobPost.objects.all())  
    caretaker_user_id = serializers.IntegerField(source='caretaker.id', read_only=True)
    job_title = serializers.SerializerMethodField()  

    class Meta:
        model = JobApplication
        fields = '__all__'

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None

    def validate(self, data):
        job = data.get('job')
        if job and job.status != 'Open':
            raise serializers.ValidationError("This job is no longer open for applications.")
        return data


class VocationalSchoolSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source="manager.username", read_only=True)
    class Meta:
        model = VocationalSchool
        fields = '__all__'
        read_only_fields = ["manager"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["manager"] = request.user
        return super().create(validated_data)    
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.location = validated_data.get("location", instance.location)
        instance.logo = validated_data.get("logo", instance.logo)
        instance.save()
        return instance

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_duration = serializers.CharField(source="course.duration", read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'


