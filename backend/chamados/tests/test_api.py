from rest_framework import status
from rest_framework.test import APITestCase

from chamados.models import Chamado


class ChamadoAPITestCase(APITestCase):

    def test_criar_chamado_valido(self):
        response = self.client.post(
            "/api/chamados/",
            {
                "titulo": "Erro no sistema",
                "descricao": "Usuário não consegue acessar",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["titulo"],
            "Erro no sistema",
        )

    def test_criar_chamado_sem_titulo(self):
        response = self.client.post(
            "/api/chamados/",
            {
                "descricao": "Chamado sem título",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "titulo",
            response.data,
        )

    def test_filtrar_chamados_por_status(self):
        Chamado.objects.create(
            titulo="Chamado aberto",
            status=Chamado.Status.ABERTO,
        )

        Chamado.objects.create(
            titulo="Chamado concluído",
            status=Chamado.Status.CONCLUIDO,
        )

        response = self.client.get(
            "/api/chamados/?status=ABERTO"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["status"],
            Chamado.Status.ABERTO,
        )

    def test_indicadores(self):
        Chamado.objects.create(
            titulo="Chamado aberto",
            status=Chamado.Status.ABERTO,
        )

        Chamado.objects.create(
            titulo="Chamado andamento",
            status=Chamado.Status.EM_ANDAMENTO,
        )

        Chamado.objects.create(
            titulo="Chamado concluído",
            status=Chamado.Status.CONCLUIDO,
        )

        response = self.client.get(
            "/api/indicadores/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["total"],
            3,
        )

        self.assertEqual(
            response.data["abertos"],
            1,
        )

        self.assertEqual(
            response.data["em_andamento"],
            1,
        )

        self.assertEqual(
            response.data["concluidos"],
            1,
        )
