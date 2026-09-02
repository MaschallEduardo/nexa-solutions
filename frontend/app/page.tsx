"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Status = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";

type Chamado = {
  id: number;
  titulo: string;
  descricao: string;
  status: Status;
  criado_em: string;
  atualizado_em: string;
};

type Indicadores = {
  total: number;
  abertos: number;
  em_andamento: number;
  concluidos: number;
};

type Mensagem = {
  tipo: "sucesso" | "erro";
  texto: string;
};

const statusOpcoes: { valor: Status; rotulo: string }[] = [
  { valor: "ABERTO", rotulo: "Aberto" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "CONCLUIDO", rotulo: "Concluído" },
];

const indicadoresIniciais: Indicadores = {
  total: 0,
  abertos: 0,
  em_andamento: 0,
  concluidos: 0,
};

function obterMensagemErro(dados: unknown): string {
  if (!dados || typeof dados !== "object") {
    return "Não foi possível concluir a operação.";
  }

  const primeiroValor = Object.values(dados)[0];

  if (Array.isArray(primeiroValor) && primeiroValor.length > 0) {
    return String(primeiroValor[0]);
  }

  if (typeof primeiroValor === "string") {
    return primeiroValor;
  }

  return "Verifique os dados informados e tente novamente.";
}

function rotuloStatus(status: Status) {
  return statusOpcoes.find((opcao) => opcao.valor === status)?.rotulo ?? status;
}

export default function Home() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [indicadores, setIndicadores] = useState(indicadoresIniciais);
  const [filtro, setFiltro] = useState<Status | "">("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<Status>("ABERTO");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const parametro = filtro ? `?status=${filtro}` : "";
      const [respostaChamados, respostaIndicadores] = await Promise.all([
        fetch(`/api/chamados/${parametro}`, { cache: "no-store" }),
        fetch("/api/indicadores/", { cache: "no-store" }),
      ]);

      if (!respostaChamados.ok || !respostaIndicadores.ok) {
        throw new Error("Erro ao consultar a API");
      }

      const [dadosChamados, dadosIndicadores] = await Promise.all([
        respostaChamados.json() as Promise<Chamado[]>,
        respostaIndicadores.json() as Promise<Indicadores>,
      ]);

      setChamados(dadosChamados);
      setIndicadores(dadosIndicadores);
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível carregar os dados. Verifique se a API está funcionando.",
      });
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    const carregamento = window.setTimeout(() => void carregarDados(), 0);

    return () => window.clearTimeout(carregamento);
  }, [carregarDados]);

  async function criarChamado(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem(null);

    if (!titulo.trim()) {
      setMensagem({ tipo: "erro", texto: "O título é obrigatório." });
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch("/api/chamados/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          status,
        }),
      });

      if (!resposta.ok) {
        const dadosErro = (await resposta.json()) as unknown;
        setMensagem({ tipo: "erro", texto: obterMensagemErro(dadosErro) });
        return;
      }

      setTitulo("");
      setDescricao("");
      setStatus("ABERTO");
      setMensagem({ tipo: "sucesso", texto: "Chamado cadastrado com sucesso." });
      await carregarDados();
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível cadastrar o chamado. Tente novamente.",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function atualizarStatus(id: number, novoStatus: Status) {
    setMensagem(null);

    try {
      const resposta = await fetch(`/api/chamados/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar o chamado");
      }

      setMensagem({ tipo: "sucesso", texto: "Status atualizado com sucesso." });
      await carregarDados();
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível atualizar o status.",
      });
    }
  }

  return (
    <main>
      <header className="cabecalho">
        <div className="limite cabecalho-conteudo">
          <div className="marca" aria-hidden="true">N</div>
          <div>
            <p className="sobrelinha">Nexa Solutions</p>
            <h1>Central de chamados</h1>
            <p className="subtitulo">Acompanhe e organize as solicitações de suporte.</p>
          </div>
        </div>
      </header>

      <div className="limite conteudo">
        {mensagem && (
          <div className={`mensagem mensagem-${mensagem.tipo}`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <section aria-labelledby="titulo-indicadores">
          <div className="titulo-secao">
            <div>
              <p className="sobrelinha">Visão geral</p>
              <h2 id="titulo-indicadores">Indicadores</h2>
            </div>
            <button className="botao-secundario" type="button" onClick={() => void carregarDados()}>
              Atualizar dados
            </button>
          </div>

          <div className="grade-indicadores">
            <article className="indicador indicador-total">
              <span>Total</span>
              <strong>{indicadores.total}</strong>
            </article>
            <article className="indicador indicador-aberto">
              <span>Abertos</span>
              <strong>{indicadores.abertos}</strong>
            </article>
            <article className="indicador indicador-andamento">
              <span>Em andamento</span>
              <strong>{indicadores.em_andamento}</strong>
            </article>
            <article className="indicador indicador-concluido">
              <span>Concluídos</span>
              <strong>{indicadores.concluidos}</strong>
            </article>
          </div>
        </section>

        <div className="grade-principal">
          <section className="painel" aria-labelledby="titulo-novo-chamado">
            <p className="sobrelinha">Nova solicitação</p>
            <h2 id="titulo-novo-chamado">Cadastrar chamado</h2>
            <p className="apoio">Preencha os dados abaixo para registrar um atendimento.</p>

            <form onSubmit={criarChamado}>
              <label htmlFor="titulo">Título <span aria-hidden="true">*</span></label>
              <input
                id="titulo"
                name="titulo"
                value={titulo}
                onChange={(evento) => setTitulo(evento.target.value)}
                placeholder="Ex.: Erro ao acessar o sistema"
                maxLength={150}
                required
              />

              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
                placeholder="Descreva o problema com mais detalhes"
                rows={5}
              />

              <label htmlFor="status">Status inicial</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(evento) => setStatus(evento.target.value as Status)}
              >
                {statusOpcoes.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                ))}
              </select>

              <button className="botao-primario" type="submit" disabled={enviando}>
                {enviando ? "Cadastrando..." : "Cadastrar chamado"}
              </button>
            </form>
          </section>

          <section className="painel painel-lista" aria-labelledby="titulo-chamados">
            <div className="titulo-lista">
              <div>
                <p className="sobrelinha">Atendimentos</p>
                <h2 id="titulo-chamados">Chamados</h2>
              </div>
              <div className="campo-filtro">
                <label htmlFor="filtro-status">Filtrar por status</label>
                <select
                  id="filtro-status"
                  value={filtro}
                  onChange={(evento) => setFiltro(evento.target.value as Status | "")}
                >
                  <option value="">Todos</option>
                  {statusOpcoes.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                  ))}
                </select>
              </div>
            </div>

            {carregando ? (
              <div className="estado-vazio">Carregando chamados...</div>
            ) : chamados.length === 0 ? (
              <div className="estado-vazio">Nenhum chamado encontrado para este filtro.</div>
            ) : (
              <div className="lista-chamados">
                {chamados.map((chamado) => (
                  <article className="chamado" key={chamado.id}>
                    <div className="chamado-topo">
                      <span className="numero">#{chamado.id}</span>
                      <span className={`status status-${chamado.status.toLowerCase()}`}>
                        {rotuloStatus(chamado.status)}
                      </span>
                    </div>
                    <h3>{chamado.titulo}</h3>
                    <p>{chamado.descricao || "Sem descrição informada."}</p>
                    <div className="chamado-rodape">
                      <time dateTime={chamado.criado_em}>
                        Criado em {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(chamado.criado_em))}
                      </time>
                      <label>
                        Alterar status
                        <select
                          value={chamado.status}
                          onChange={(evento) => void atualizarStatus(
                            chamado.id,
                            evento.target.value as Status,
                          )}
                          aria-label={`Alterar status do chamado ${chamado.titulo}`}
                        >
                          {statusOpcoes.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer>
        <div className="limite">Nexa Solutions · Sistema interno de suporte</div>
      </footer>
    </main>
  );
}
