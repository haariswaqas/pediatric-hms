from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..models import User, OTP, DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile, ParentProfile
from ..serializers import AdminUserSerializer, ParentProfileSerializer, DoctorProfileSerializer, NurseProfileSerializer, LabTechProfileSerializer, PharmacistProfileSerializer
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from ..permissions import IsAdminUser, IsMedicalProfessionalUser, IsParentUser
from ..tasks import send_email_task, create_system_log_task
from django_elasticsearch_dsl.search import Search
from rest_framework.views import APIView
from ..serializers import UserSearchSerializer

class AdminUserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        try:
            raw_password = self.request.data.get('password')
            user = serializer.save(created_by_admin=True)
            user.set_password(raw_password)
            user._raw_password = raw_password  
            user.created_by_admin = True
            user.save()

            otp_code = OTP.generate_otp()
            OTP.objects.create(user=user, code=otp_code, is_verified=True)

            subject = "Welcome to the Hospital Portal!"
            message = (
                f"Dear {user.username},\n\n"
                "You have been added to the system by the admin. Here are your login credentials:\n\n"
                f"Email: {user.email}\nPassword: {raw_password}\n\n"
                "Please log in and change your password after your first login.\n\n"
                "Best regards,\nHospital Admin"
            )
            send_email_task.delay(subject, message, [user.email])

            create_system_log_task.delay(
                level='INFO',
                message=f"New user created by admin: {user.username}",
                user_id=user.id
            )
        except Exception as e:
            create_system_log_task.delay(
                level='ERROR',
                message=f"Error creating user: {str(e)}",
                user_id=self.request.user.id
            )
            raise

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        try:
            if user.status != User.BANNED:
                user.status = User.BANNED
                user.save()
                subject = "Banned From Logging In!"
                message = (
                    f"Dear {user.username},\n\n"
                    "You have been banned. Contact support for more info.\n\n"
                    "Best regards,\nHospital Admin"
                )
                send_email_task.delay(subject, message, [user.email])

                create_system_log_task.delay(
                    level='INFO',
                    message=f"User {user.username} was banned by admin.",
                    user_id=request.user.id
                )
                return Response({"status": "user banned"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": "user is already banned"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            create_system_log_task.delay(
                level='ERROR',
                message=f"Error banning user {user.username}: {str(e)}",
                user_id=request.user.id
            )
            return Response({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        try:
            if user.status == User.BANNED:
                user.status = User.ACTIVE
                user.save()
                subject = "You can login now!"
                message = (
                    f"Dear {user.username},\n\n"
                    "Your account has now been activated. You can now login with your credentials.\n\n"
                    "Best regards,\nHospital Admin"
                )
                send_email_task.delay(subject, message, [user.email])

                create_system_log_task.delay(
                    level='INFO',
                    message=f"User {user.username} was activated by admin.",
                    user_id=request.user.id
                )
                return Response({"status": "user is active now"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": "user is already active"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            create_system_log_task.delay(
                level='ERROR',
                message=f"Error activating user {user.username}: {str(e)}",
                user_id=request.user.id
            )
            return Response({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def manual_verify_medical_professional(self, request, pk=None):
        user = self.get_object()
        try:
            if user.role == User.PARENT:
                create_system_log_task.delay(
                    level='WARNING',
                    message=f"Attempted verification of a non-medical user: {user.username}",
                    user_id=request.user.id
                )
                return Response({"error": "This user is not a medical professional."}, status=status.HTTP_400_BAD_REQUEST)

            if user.created_by_admin:
                return Response({"status": "user already verified by admin"}, status=status.HTTP_400_BAD_REQUEST)

            user.created_by_admin = True
            user.save()

            subject = "Your Account Has Been Verified by Admin"
            message = (
                f"Dear {user.username},\n\n"
                "Your account has been verified by an admin. You may now log in and access all functionalities related to your role.\n\n"
                "Best regards,\nHospital Admin"
            )
            send_email_task.delay(subject, message, [user.email])

            create_system_log_task.delay(
                level='INFO',
                message=f"User {user.username} manually verified by admin.",
                user_id=request.user.id
            )
            return Response({"status": "user manually verified successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            create_system_log_task.delay(
                level='ERROR',
                message=f"Error during manual verification of user {user.username}: {str(e)}",
                user_id=request.user.id
            )
            return Response({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   
class AdminDoctorProfileViewSet(ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsParentUser | IsAdminUser]


class AdminNurseProfileViewSet(ModelViewSet):
    queryset = NurseProfile.objects.all()
    serializer_class = NurseProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminPharmacistProfileViewSet(ModelViewSet):
    queryset = PharmacistProfile.objects.all()
    serializer_class = PharmacistProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminLabTechProfileViewSet(ModelViewSet):
    queryset = LabTechProfile.objects.all()
    serializer_class = LabTechProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminParentProfileViewSet(ModelViewSet):
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser | IsMedicalProfessionalUser]


class UserSearchView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.GET.get("q", "")
        if not query:
            return Response({"error": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            search = Search(index="users").query(
                "multi_match",
                query=query,
                fields=["username", "email", "role"],
                type="phrase_prefix"  # <<< ADDED here
            )
            results = search.execute()
            serialized_results = [UserSearchSerializer(hit.to_dict()).data for hit in results]

            
            return Response(serialized_results)

        except Exception as e:
            
            return Response({"error": "An error occurred while searching."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
