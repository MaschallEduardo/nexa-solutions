from rest_framework import generics
from rest_framework.exceptions import ValidationError

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