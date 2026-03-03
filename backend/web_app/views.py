from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from .models import Department, Employee, Payment
from .serializers import DepartmentSerializer, EmployeeSerializer, PaymentSerializer, UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_employees = Employee.objects.filter(status='active').count()
    total_departments = Department.objects.count()
    total_payments = Payment.objects.filter(status='processed').aggregate(total=Sum('amount'))['total'] or 0
    pending_payments = Payment.objects.filter(status='pending').count()

    dept_data = Department.objects.annotate(
        count=Count('employees', filter=Q(employees__status='active'))
    ).values('name', 'count')[:5]

    recent_payments = Payment.objects.select_related('employee').order_by('-created_at')[:5]
    payment_data = PaymentSerializer(recent_payments, many=True).data

    return Response({
        'total_employees': total_employees,
        'total_departments': total_departments,
        'total_payments': float(total_payments),
        'pending_payments': pending_payments,
        'department_breakdown': list(dept_data),
        'recent_payments': payment_data,
    })


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'head']
    ordering_fields = ['name', 'created_at']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'employee_id', 'job_title']
    ordering_fields = ['last_name', 'date_joined', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        department = self.request.query_params.get('department')
        status_filter = self.request.query_params.get('status')
        if department:
            queryset = queryset.filter(department_id=department)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('employee').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reference', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['payment_date', 'amount', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        payment_type = self.request.query_params.get('payment_type')
        status_filter = self.request.query_params.get('status')
        employee = self.request.query_params.get('employee')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if employee:
            queryset = queryset.filter(employee_id=employee)
        return queryset