"use client";

import { useMemo, useState } from "react";

type TipoDesligamento = "SEM_JUSTA_CAUSA" | "PEDIDO_DE_DEMISSAO";

type Resultado = {
  saldoSalario: number;
  decimoTerceiroProporcional: number;
  feriasProporcionais: number;
  tercoConstitucional: number;
  avisoPrevioEstimado: number;
  total: number;
};

function parseNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function monthsWorkedInYear(dateDemissao: Date): number {
  return dateDemissao.getMonth() + 1;
}

export default function Home() {
  const [tipoDesligamento, setTipoDesligamento] = useState<TipoDesligamento>(
    "SEM_JUSTA_CAUSA"
  );
  const [salarioBruto, setSalarioBruto] = useState("3000");
  const [dataAdmissao, setDataAdmissao] = useState("2024-01-01");
  const [dataDemissao, setDataDemissao] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [diasTrabalhadosMes, setDiasTrabalhadosMes] = useState("30");
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const dadosValidos = useMemo(() => {
    const adm = parseDate(dataAdmissao);
    const dem = parseDate(dataDemissao);
    const sal = parseNumber(salarioBruto);
    const dias = parseNumber(diasTrabalhadosMes);
    return {
      adm,
      dem,
      sal,
      dias: clamp(dias, 0, 31),
      ok: !!adm && !!dem && dem >= adm && sal > 0,
    };
  }, [dataAdmissao, dataDemissao, salarioBruto, diasTrabalhadosMes]);

  function calcular(): void {
    if (!dadosValidos.ok || !dadosValidos.adm || !dadosValidos.dem) {
      window.alert("Preencha salário e datas corretamente.");
      return;
    }

    const salario = dadosValidos.sal;
    const diasTrabalhados = dadosValidos.dias;
    const adm = dadosValidos.adm;
    const dem = dadosValidos.dem;

    const saldoSalario = (salario / 30) * diasTrabalhados;

    const mesesNoAno = monthsWorkedInYear(dem);
    const decimoTerceiroProporcional = (salario / 12) * mesesNoAno;

    const feriasProporcionais = (salario / 12) * mesesNoAno;
    const tercoConstitucional = feriasProporcionais / 3;

    const anosTrabalhados = Math.floor(daysBetween(adm, dem) / 365);
    const diasAviso = clamp(30 + anosTrabalhados * 3, 30, 90);
    const avisoPrevioEstimado =
      tipoDesligamento === "SEM_JUSTA_CAUSA" ? (salario / 30) * diasAviso : 0;

    const feriasVencidasValor = feriasVencidas ? salario + salario / 3 : 0;

    const total =
      saldoSalario +
      decimoTerceiroProporcional +
      feriasProporcionais +
      tercoConstitucional +
      avisoPrevioEstimado +
      feriasVencidasValor;

    setResultado({
      saldoSalario,
      decimoTerceiroProporcional,
      feriasProporcionais: feriasProporcionais + feriasVencidasValor,
      tercoConstitucional,
      avisoPrevioEstimado,
      total,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Calculadora de Rescisão CLT
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-zinc-700">
            Simule valores estimados de rescisão (saldo de salário, 13º proporcional,
            férias proporcionais + 1/3 e aviso prévio).
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Dados</h2>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Tipo de desligamento</span>
                <select
                  className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  value={tipoDesligamento}
                  onChange={(e) => {
                    setTipoDesligamento(e.target.value as TipoDesligamento);
                    setResultado(null);
                  }}
                >
                  <option value="SEM_JUSTA_CAUSA">Demissão sem justa causa</option>
                  <option value="PEDIDO_DE_DEMISSAO">Pedido de demissão</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Salário bruto (R$)</span>
                <input
                  className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  type="number"
                  min={0}
                  step={0.01}
                  value={salarioBruto}
                  onChange={(e) => {
                    setSalarioBruto(e.target.value);
                    setResultado(null);
                  }}
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-700">Data de admissão</span>
                  <input
                    className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    type="date"
                    value={dataAdmissao}
                    onChange={(e) => {
                      setDataAdmissao(e.target.value);
                      setResultado(null);
                    }}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-700">Data de demissão</span>
                  <input
                    className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    type="date"
                    value={dataDemissao}
                    onChange={(e) => {
                      setDataDemissao(e.target.value);
                      setResultado(null);
                    }}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Dias trabalhados no mês (0–31)</span>
                <input
                  className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  type="number"
                  min={0}
                  max={31}
                  step={1}
                  value={diasTrabalhadosMes}
                  onChange={(e) => {
                    setDiasTrabalhadosMes(e.target.value);
                    setResultado(null);
                  }}
                />
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={feriasVencidas}
                  onChange={(e) => {
                    setFeriasVencidas(e.target.checked);
                    setResultado(null);
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm text-zinc-700">Tenho férias vencidas (1 período)</span>
              </label>

              <button
                type="button"
                onClick={calcular}
                className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-sky-600 px-5 font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Calcular
              </button>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Aviso: esta é uma simulação simplificada. Não inclui FGTS/multa de 40%,
                descontos (INSS/IRRF), adicionais, comissões, convenções coletivas e outras
                particularidades.
              </p>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">Resultados</h2>

              {!resultado ? (
                <p className="mt-3 text-zinc-700">
                  Preencha os dados e clique em <strong>Calcular</strong>.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-sky-50 p-4">
                    <p className="text-sm text-zinc-700">Saldo de salário</p>
                    <p className="mt-1 text-xl font-bold text-sky-700">
                      {formatarMoeda(resultado.saldoSalario)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm text-zinc-700">13º proporcional</p>
                    <p className="mt-1 text-xl font-bold text-emerald-700">
                      {formatarMoeda(resultado.decimoTerceiroProporcional)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4">
                    <p className="text-sm text-zinc-700">Férias (prop. + vencidas)</p>
                    <p className="mt-1 text-xl font-bold text-indigo-700">
                      {formatarMoeda(resultado.feriasProporcionais)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-violet-50 p-4">
                    <p className="text-sm text-zinc-700">1/3 constitucional</p>
                    <p className="mt-1 text-xl font-bold text-violet-700">
                      {formatarMoeda(resultado.tercoConstitucional)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 sm:col-span-2">
                    <p className="text-sm text-zinc-700">Aviso prévio (estimado)</p>
                    <p className="mt-1 text-xl font-bold text-amber-700">
                      {formatarMoeda(resultado.avisoPrevioEstimado)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:col-span-2">
                    <p className="text-sm text-zinc-700">Total estimado</p>
                    <p className="mt-1 text-2xl font-extrabold text-zinc-900">
                      {formatarMoeda(resultado.total)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900">O que esta calculadora inclui?</h2>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Saldo de salário, 13º proporcional, férias proporcionais + 1/3 e aviso prévio
                estimado (quando aplicável).
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
