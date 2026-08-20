from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chamado
from .serializers import ChamadoSerializer


class ChamadoListCreateView(generics.ListCreateAPIView):
    serializer_class = ChamadoSerializer

    def get_queryset(self):
        queryset = Chamado.objects.all().order_by("-criado_em")

        status = self.request.query_params.get("status")

        if not status:
            return queryset

        status_validos = Chamado.Status.values

        if status not in status_validos:
            raise ValidationError(
                {
                    "status": (
                        f"Status inválido. Valores permitidos: "
                        f"{', '.join(status_validos)}."
                    )
                }
            )

        return queryset.filter(status=status)


class ChamadoDetailView(generics.RetrieveUpdateAPIView):
    queryset = Chamado.objects.all()
    serializer_class = ChamadoSerializer

class IndicadoresView(APIView):
    def get(self, request):
        indicadores = Chamado.objects.aggregate(
            total=Count("id"),
            abertos=Count(
                "id",
                filter=Q(status=Chamado.Status.ABERTO),
            ),
            em_andamento=Count(
                "id",
                filter=Q(status=Chamado.Status.EM_ANDAMENTO),
            ),
            concluidos=Count(
                "id",
                filter=Q(status=Chamado.Status.CONCLUIDO),
            ),
        )

        return Response(indicadores)