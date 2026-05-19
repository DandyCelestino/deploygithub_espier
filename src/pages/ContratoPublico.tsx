import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ShieldCheck, Download, Share2 } from "lucide-react";
import logoEspier from "@/assets/espier-logo-transparent.png";

interface Item { descricao: string; quantidade: number; valor_unit: number; }

const fmt = (v: number) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "____ / ____ / ______";

const ContratoPublico = () => {
  const { token } = useParams();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [enviando, setEnviando] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.rpc("get_contrato_by_token", { _token: token! });
    setLoading(false);
    if (error || !res) { toast({ title: "Contrato não encontrado", variant: "destructive" }); return; }
    setData(res);
  };
  useEffect(() => { if (token) load(); }, [token]);

  // Auto-print quando vier com ?print=1 (usado pelo admin para gerar PDF)
  useEffect(() => {
    if (!loading && data?.contrato && params.get("print") === "1") {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [loading, data, params]);

  const assinar = async () => {
    if (nome.trim().length < 3 || cpf.replace(/\D/g, "").length < 11) {
      toast({ title: "Preencha nome completo e CPF válido", variant: "destructive" }); return;
    }
    setEnviando(true);
    const { data: res, error } = await supabase.rpc("assinar_contrato", { _token: token!, _nome: nome, _cpf: cpf });
    setEnviando(false);
    if (error || !(res as any)?.ok) { toast({ title: "Erro ao assinar", description: (res as any)?.error ?? error?.message, variant: "destructive" }); return; }
    toast({ title: "Contrato assinado com sucesso!" });
    load();
    // Após assinar, oferecer download automático
    setTimeout(() => window.print(), 800);
  };

  const compartilharWhatsapp = () => {
    const link = window.location.origin + `/contrato/${token}`;
    const msg = `Contrato ${data?.contrato?.numero_contrato ?? ""} assinado digitalmente. Acesse: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (!data?.contrato) return <div className="min-h-screen flex items-center justify-center text-slate-600">Contrato não encontrado ou link expirado.</div>;

  const c = data.contrato;
  const cl = data.cliente ?? {};
  const itens: Item[] = Array.isArray(c.itens) ? c.itens : [];
  const assinado = !!c.data_assinatura;

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-3">
        <div className="flex justify-between items-center mb-4 print:hidden flex-wrap gap-2">
          <div className="text-sm text-slate-600">Contrato <strong>{c.numero_contrato}</strong> {assinado && <span className="ml-2 text-emerald-700 text-xs font-bold">✓ ASSINADO</span>}</div>
          <div className="flex gap-2">
            {assinado && <Button variant="outline" size="sm" onClick={compartilharWhatsapp}><Share2 className="w-4 h-4 mr-1.5" /> Compartilhar</Button>}
            <Button variant="outline" size="sm" onClick={() => window.print()}><Download className="w-4 h-4 mr-1.5" /> Baixar PDF</Button>
          </div>
        </div>


        <article className="bg-white shadow-sm rounded-lg p-8 sm:p-12 print:shadow-none print:p-0 text-slate-800 text-[14px] leading-relaxed">
          <header className="text-center border-b pb-4 mb-6">
            <div className="text-xs text-slate-500 tracking-widest">ESPIER.TELECOM — TI · TELECOM · SEGURANÇA</div>
            <h1 className="text-2xl font-bold mt-2">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
            <div className="text-sm text-slate-600 mt-1">Nº {c.numero_contrato} · Emitido em {fmtDate(c.created_at)}</div>
          </header>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Partes</h2>
            <p><strong>CONTRATADA:</strong> ESPIER.TELECOM, com sede no Rio de Janeiro/RJ, contato: (21) 96000-1439 · espier.telecom@gmail.com.</p>
            <p className="mt-2"><strong>CONTRATANTE:</strong> {cl.name ?? "—"}{cl.document ? `, ${cl.tipo_pessoa === "juridica" ? "CNPJ" : "CPF"} ${cl.document}` : ""}{cl.address ? `, residente/sediado em ${cl.address}` : ""}{cl.city ? `, ${cl.city}/${cl.state ?? ""}` : ""}{cl.cep ? ` — CEP ${cl.cep}` : ""}. Contato: {cl.phone ?? "—"} · {cl.email ?? "—"}.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 1ª — Do Objeto</h2>
            <p>{c.objeto || "Prestação de serviços técnicos especializados nas áreas de TI, telecom e segurança eletrônica, conforme escopo e itens descritos abaixo."}</p>
            {itens.length > 0 && (
              <table className="w-full mt-3 text-sm border border-slate-300">
                <thead className="bg-slate-50"><tr><th className="border-b border-slate-300 px-2 py-1 text-left">Item / Serviço</th><th className="border-b border-slate-300 px-2 py-1 w-16 text-center">Qtd</th><th className="border-b border-slate-300 px-2 py-1 w-28 text-right">Valor Unit.</th><th className="border-b border-slate-300 px-2 py-1 w-28 text-right">Subtotal</th></tr></thead>
                <tbody>{itens.map((it, i) => (
                  <tr key={i}><td className="border-t border-slate-200 px-2 py-1">{it.descricao}</td><td className="border-t border-slate-200 px-2 py-1 text-center">{it.quantidade}</td><td className="border-t border-slate-200 px-2 py-1 text-right">{fmt(it.valor_unit)}</td><td className="border-t border-slate-200 px-2 py-1 text-right">{fmt(it.quantidade * it.valor_unit)}</td></tr>
                ))}</tbody>
              </table>
            )}
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 2ª — Do Prazo de Execução</h2>
            <p>Os serviços serão executados no prazo de <strong>{c.prazo_execucao_dias ?? "—"} dia(s)</strong> contados a partir da assinatura deste instrumento e da liberação do acesso ao local pela CONTRATANTE, salvo impedimentos técnicos comprovados.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 3ª — Do Valor e Forma de Pagamento</h2>
            <p>O valor total dos serviços é de <strong>{fmt(c.total_value)}</strong>{c.valor_mensal > 0 ? <>, acrescido de mensalidade recorrente de <strong>{fmt(c.valor_mensal)}</strong> referente à manutenção continuada</> : null}. Forma de pagamento: <strong>{c.forma_pagamento || "a combinar"}</strong>. O atraso superior a 10 (dez) dias incidirá em multa de 2% e juros de 1% ao mês.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 4ª — Da Garantia Técnica e SLA</h2>
            <p>A CONTRATADA garante os serviços executados pelo prazo de <strong>{c.garantia_meses ?? 12} mês(es)</strong> contra defeitos de instalação e mão de obra. Para chamados em garantia ou suporte previsto neste contrato, o prazo de resposta inicial será de até <strong>{c.sla_resposta_horas ?? 24} hora(s) úteis</strong>. Não se incluem na garantia danos por mau uso, descarga elétrica, intempéries ou intervenção de terceiros.</p>
          </section>

          {c.valor_mensal > 0 && (
            <section className="mb-5">
              <h2 className="font-bold uppercase text-sm mb-2">Cláusula 5ª — Da Manutenção e Mensalidade</h2>
              <p>Durante a vigência, a CONTRATADA prestará serviços de manutenção preventiva e corretiva, incluindo monitoramento técnico, atualização de configurações e suporte remoto, mediante o pagamento da mensalidade prevista na Cláusula 3ª. Visitas presenciais decorrentes de mau uso poderão ser cobradas à parte conforme tabela vigente.</p>
            </section>
          )}

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 6ª — Da Proteção de Dados (LGPD)</h2>
            <p>As partes comprometem-se a tratar os dados pessoais e empresariais a que tiverem acesso em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), utilizando-os exclusivamente para a execução deste contrato. A CONTRATADA adota medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 7ª — Da Confidencialidade</h2>
            <p>Toda informação técnica, comercial, estratégica, imagens de câmeras, senhas, projetos e dados de clientes acessados em razão deste contrato são considerados <strong>sigilosos</strong>. A obrigação de confidencialidade subsiste por 5 (cinco) anos após o término deste instrumento.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 8ª — Das Obrigações da CONTRATANTE</h2>
            <p>Disponibilizar acesso ao local, energia elétrica, ponto de internet quando aplicável e demais condições necessárias à execução; efetuar os pagamentos nas datas acordadas; comunicar imediatamente quaisquer ocorrências relacionadas aos equipamentos instalados.</p>
          </section>

          <section className="mb-5">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 9ª — Da Rescisão</h2>
            <p>O presente contrato poderá ser rescindido por qualquer das partes mediante notificação prévia de 30 (trinta) dias. A rescisão imotivada antes do término da execução ensejará o pagamento proporcional aos serviços já prestados e dos materiais aplicados.</p>
          </section>

          <section className="mb-6">
            <h2 className="font-bold uppercase text-sm mb-2">Cláusula 10ª — Do Foro</h2>
            <p>Fica eleito o Foro da Comarca da Capital do Estado do Rio de Janeiro/RJ para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </section>

          {c.observacoes && (
            <section className="mb-6 bg-slate-50 border border-slate-200 rounded p-3">
              <h2 className="font-bold uppercase text-sm mb-1">Observações Adicionais</h2>
              <p className="whitespace-pre-wrap">{c.observacoes}</p>
            </section>
          )}

          <section className="mt-10 border-t pt-6">
            {assinado ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-800">
                <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-5 h-5" /> Contrato assinado digitalmente</div>
                <div className="text-sm mt-1">Por <strong>{c.assinatura_nome}</strong> em {new Date(c.data_assinatura).toLocaleString("pt-BR")}.</div>
              </div>
            ) : (
              <div className="print:hidden">
                <h2 className="font-bold uppercase text-sm mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Aceite digital</h2>
                <p className="text-sm text-slate-600 mb-3">Confirme abaixo seus dados para registrar o aceite digital deste contrato. A confirmação tem valor legal nos termos do art. 10, §2º, da MP 2.200-2/2001.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                  <Input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} />
                </div>
                <Button className="mt-3 w-full sm:w-auto" onClick={assinar} disabled={enviando}>{enviando ? "Registrando..." : "Aceitar e assinar"}</Button>
              </div>
            )}
            <div className="hidden print:block mt-12">
              <div className="grid grid-cols-2 gap-12 text-center">
                <div><div className="border-t border-slate-800 pt-2">CONTRATADA — Espier.Telecom</div></div>
                <div><div className="border-t border-slate-800 pt-2">CONTRATANTE — {cl.name}</div></div>
              </div>
            </div>
          </section>
        </article>

        <div className="text-center text-xs text-slate-400 mt-6 print:hidden">Documento eletrônico gerado por Espier.Telecom.</div>
      </div>
    </div>
  );
};

export default ContratoPublico;
