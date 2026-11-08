import {
  AdminCounters,
  AdminUserItem,
  Agendamento,
  Cliente,
  Documento,
  Empresa,
  HorarioAtendimento,
  IntUser,
  LocationType,
  OcupadoSlot,
  OrderStatus,
  Produto,
} from '../types';

const STORAGE_KEY_PREFIX = 'credmaisplus_db_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

// Fixed UUID for initial consultant Fernando Silva
export const OWNER_USER_ID = 'd0d0d0d0-0000-4000-a000-000000000001';
export const OWNER_EMAIL = 'fernandotarginodasilva@gmail.com';

const INITIAL_EMPRESA: Empresa = {
  id: 1,
  nome: 'CREDMAISPLUS',
  telefone: '(11) 99999-0000',
  endereco: 'Rua Exemplo, 100, Centro',
  mensagem: 'Atendimento com hora marcada, sem filas e sem enrolação.',
  duracao_min: 30,
  vagas_por_horario: 1,
  antecedencia_horas: 2,
  atende_domicilio: true,
};

const INITIAL_HORARIOS: HorarioAtendimento[] = [
  { dia_semana: 0, ativo: false, inicio: '09:00', fim: '13:00', pausa_inicio: null, pausa_fim: null },
  { dia_semana: 1, ativo: true, inicio: '09:00', fim: '18:00', pausa_inicio: '12:00', pausa_fim: '13:00' },
  { dia_semana: 2, ativo: true, inicio: '09:00', fim: '18:00', pausa_inicio: '12:00', pausa_fim: '13:00' },
  { dia_semana: 3, ativo: true, inicio: '09:00', fim: '18:00', pausa_inicio: '12:00', pausa_fim: '13:00' },
  { dia_semana: 4, ativo: true, inicio: '09:00', fim: '18:00', pausa_inicio: '12:00', pausa_fim: '13:00' },
  { dia_semana: 5, ativo: true, inicio: '09:00', fim: '18:00', pausa_inicio: '12:00', pausa_fim: '13:00' },
  { dia_semana: 6, ativo: true, inicio: '09:00', fim: '13:00', pausa_inicio: null, pausa_fim: null },
];

const INITIAL_PRODUTOS: Produto[] = [
  {
    id: 1,
    slug: 'consignado',
    nome: 'Crédito consignado',
    subtitulo: 'INSS e servidores públicos.',
    resumo:
      'Empréstimo com parcelas descontadas direto do benefício ou do salário. As taxas costumam ser as menores do mercado e as parcelas cabem no orçamento.',
    para_quem:
      'Aposentados e pensionistas do INSS, servidores públicos federais, estaduais e municipais e alguns trabalhadores de empresas conveniadas.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Último contracheque ou extrato do benefício do INSS | Comprovante de residência recente.',
    icone: 'Landmark',
    ordem: 1,
    ativo: true,
    atende_domicilio: true,
  },
  {
    id: 2,
    slug: 'pessoal',
    nome: 'Empréstimo pessoal',
    subtitulo: 'Dinheiro rápido para o que você precisar.',
    resumo:
      'Crédito sem precisar explicar o destino do dinheiro. Você escolhe o valor e o prazo e paga em parcelas fixas.',
    para_quem:
      'Quem tem renda comprovada e quer resolver uma necessidade pessoal, quitar dívidas mais caras ou organizar as contas.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Comprovante de renda dos últimos 3 meses | Comprovante de residência recente.',
    icone: 'Wallet',
    ordem: 2,
    ativo: true,
    atende_domicilio: false,
  },
  {
    id: 3,
    slug: 'veiculo',
    nome: 'Financiamento de veículo',
    subtitulo: 'Carro ou moto com parcelas que cabem.',
    resumo:
      'Financie veículo novo ou usado com entrada reduzida e prazo longo. Simulamos as melhores condições entre vários bancos.',
    para_quem:
      'Quem quer comprar carro ou moto, ou trocar o atual, com renda comprovada e nome em boa situação.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Comprovante de renda | Comprovante de residência recente | Dados do veículo (modelo, ano e valor).',
    icone: 'Car',
    ordem: 3,
    ativo: true,
    atende_domicilio: false,
  },
  {
    id: 4,
    slug: 'imovel',
    nome: 'Crédito com garantia de imóvel',
    subtitulo: 'Valores altos com a menor taxa.',
    resumo:
      'Use um imóvel seu como garantia e consiga valores maiores, prazos de até 20 anos ou mais e taxas bem menores que as do crédito comum.',
    para_quem:
      'Proprietários de imóvel quitado ou financiado que precisam de um valor alto para investir, reformar ou organizar a vida financeira.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Matrícula atualizada do imóvel | Comprovante de renda | Comprovante de residência recente.',
    icone: 'Home',
    ordem: 4,
    ativo: true,
    atende_domicilio: false,
  },
  {
    id: 5,
    slug: 'fgts',
    nome: 'FGTS e saque-aniversário',
    subtitulo: 'Antecipe o dinheiro do seu FGTS.',
    resumo:
      'Receba agora, de uma vez, os valores do saque-aniversário que cairiam nos próximos anos, sem sair da sua conta do FGTS.',
    para_quem:
      'Trabalhadores com carteira assinada que aderiram, ou querem aderir, ao saque-aniversário do FGTS.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Carteira de trabalho digital ou extrato do FGTS | Dados bancários (agência e conta).',
    icone: 'PiggyBank',
    ordem: 5,
    ativo: true,
    atende_domicilio: true,
  },
  {
    id: 6,
    slug: 'cartao',
    nome: 'Cartão de crédito consignado',
    subtitulo: 'Cartão com desconto em folha.',
    resumo:
      'Cartão com limite exclusivo e fatura descontada direto do benefício ou do salário, com saque complementar disponível.',
    para_quem:
      'Aposentados e pensionistas do INSS e servidores públicos que querem um cartão com condições especiais.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Contracheque ou extrato do benefício do INSS | Comprovante de residência recente.',
    icone: 'CreditCard',
    ordem: 6,
    ativo: true,
    atende_domicilio: false,
  },
  {
    id: 7,
    slug: 'conta-bb',
    nome: 'Abertura de conta BB',
    subtitulo: 'Abra sua conta no Banco do Brasil com ajuda.',
    resumo:
      'Abrimos sua conta no Banco do Brasil com acompanhamento de um consultor, do cadastro à ativação, sem filas e sem burocracia.',
    para_quem:
      'Quem ainda não tem conta no Banco do Brasil ou quer abrir uma conta nova, para receber salário, benefício ou movimentar o dia a dia.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Comprovante de residência recente | Comprovante de renda, se tiver.',
    icone: 'Building2',
    ordem: 7,
    ativo: true,
    atende_domicilio: true,
  },
  {
    id: 8,
    slug: 'bolsa-familia',
    nome: 'Crédito Bolsa Família',
    subtitulo: 'Crédito para quem recebe o benefício.',
    resumo:
      'Atendimento para quem recebe o Bolsa Família e quer conhecer as opções de crédito disponíveis. O consultor explica as condições antes de qualquer contratação.',
    para_quem:
      'Beneficiários do Bolsa Família que querem entender as condições de crédito disponíveis para o seu perfil.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Cartão ou extrato do benefício | Comprovante de residência recente.',
    icone: 'Users',
    ordem: 8,
    ativo: true,
    atende_domicilio: false,
  },
  {
    id: 9,
    slug: 'conta-luz',
    nome: 'Crédito pela conta de luz',
    subtitulo: 'Crédito usando o histórico da sua conta de energia.',
    resumo:
      'Crédito com análise feita a partir da sua conta de energia elétrica. Em muitos casos a aprovação é mais simples do que no crédito tradicional.',
    para_quem:
      'Titulares de conta de luz em dia que querem crédito com uma análise mais simples.',
    documentos:
      'Documento com foto (RG ou CNH) | CPF | Última conta de luz em seu nome | Comprovante de residência recente.',
    icone: 'Zap',
    ordem: 9,
    ativo: true,
    atende_domicilio: true,
  },
];

const INITIAL_INT_USERS: IntUser[] = [
  {
    user_id: OWNER_USER_ID,
    email: OWNER_EMAIL,
    access_level: 'admin',
    enabled: true,
    name: 'Fernando Silva',
  },
  {
    user_id: 'c0c0c0c0-0000-4000-a000-000000000002',
    email: 'maria.souza@exemplo.com',
    access_level: 'user',
    enabled: true,
    name: 'Maria Souza',
  },
];

const INITIAL_ADMINISTRADORES: string[] = [OWNER_USER_ID];

const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 1,
    usuario_id: OWNER_USER_ID,
    nome: 'Fernando Silva',
    telefone: '(11) 99999-0000',
    cpf: '111.444.777-35',
    email: OWNER_EMAIL,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 2,
    usuario_id: 'c0c0c0c0-0000-4000-a000-000000000002',
    nome: 'Maria Souza Oliveira',
    telefone: '(11) 98765-4321',
    cpf: '529.982.247-25',
    email: 'maria.souza@exemplo.com',
    criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
    atualizado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Sample initial order to demonstrate active orders
const INITIAL_AGENDAMENTOS: Agendamento[] = [
  {
    id: 101,
    cliente_id: 2,
    usuario_id: 'c0c0c0c0-0000-4000-a000-000000000002',
    produto_id: 1,
    data_agendada: getTomorrowDateString(),
    hora: '14:00',
    local_tipo: 'DOMICILIO',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    referencia: 'Prédio espelhado, portão azul ao lado da farmácia',
    observacao: 'Prefiro ser atendida no início da tarde por favor.',
    status: 'PENDENTE',
    nova_data: null,
    nova_hora: null,
    mensagem_consultor: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
];

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Database helper functions
export const DatabaseStore = {
  // Raw Table Getters / Setters
  getEmpresa(): Empresa {
    return getStorage<Empresa>('empresa', INITIAL_EMPRESA);
  },
  setEmpresa(empresa: Empresa): void {
    setStorage('empresa', empresa);
  },

  getHorarios(): HorarioAtendimento[] {
    return getStorage<HorarioAtendimento[]>('horarios_atendimento', INITIAL_HORARIOS);
  },
  setHorarios(horarios: HorarioAtendimento[]): void {
    setStorage('horarios_atendimento', horarios);
  },

  getProdutos(): Produto[] {
    return getStorage<Produto[]>('produtos', INITIAL_PRODUTOS);
  },

  getClientes(): Cliente[] {
    return getStorage<Cliente[]>('clientes', INITIAL_CLIENTES);
  },
  setClientes(clientes: Cliente[]): void {
    setStorage('clientes', clientes);
  },

  getAgendamentos(): Agendamento[] {
    return getStorage<Agendamento[]>('agendamentos', INITIAL_AGENDAMENTOS);
  },
  setAgendamentos(agendamentos: Agendamento[]): void {
    setStorage('agendamentos', agendamentos);
  },

  getDocumentos(): Documento[] {
    return getStorage<Documento[]>('documentos', []);
  },
  setDocumentos(docs: Documento[]): void {
    setStorage('documentos', docs);
  },

  getAdmins(): string[] {
    return getStorage<string[]>('administradores', INITIAL_ADMINISTRADORES);
  },
  setAdmins(admins: string[]): void {
    setStorage('administradores', admins);
  },

  getIntUsers(): IntUser[] {
    const list = getStorage<IntUser[]>('int_users', INITIAL_INT_USERS);
    return list.filter((u) => u.email !== 'cliente.google@exemplo.com');
  },
  setIntUsers(users: IntUser[]): void {
    setStorage('int_users', users.filter((u) => u.email !== 'cliente.google@exemplo.com'));
  },

  getIsOpenRegistration(): boolean {
    return getStorage<boolean>('open_registration', true);
  },
  setIsOpenRegistration(open: boolean): void {
    setStorage('open_registration', open);
  },

  getIsEmailLoginEnabled(): boolean {
    return getStorage<boolean>('email_login_enabled', true);
  },
  setIsEmailLoginEnabled(enabled: boolean): void {
    setStorage('email_login_enabled', enabled);
  },

  // Ensure an INT_USER exists upon sign-in
  registerIntUser(email: string, name?: string): IntUser {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getIntUsers();

    // If owner Fernando Targino da Silva
    if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
      let owner = users.find((u) => u.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
      if (!owner) {
        owner = {
          user_id: OWNER_USER_ID,
          email: OWNER_EMAIL,
          access_level: 'admin',
          enabled: true,
          name: name || 'Fernando Silva',
        };
        users.push(owner);
        this.setIntUsers(users);
      } else if (name && owner.name !== name) {
        owner.name = name;
        this.setIntUsers(users);
      }
      return owner;
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (name && !existing.name) {
        existing.name = name;
        this.setIntUsers(users);
      }
      return existing;
    }

    const newUser: IntUser = {
      user_id: crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: cleanEmail,
      access_level: 'user',
      enabled: true,
      name: name || email.split('@')[0],
    };

    users.push(newUser);
    this.setIntUsers(users);
    return newUser;
  },

  // --------------------------------------------------------------------------
  // The 20 SQL Server Functions as defined in 4.9
  // --------------------------------------------------------------------------

  // 1. perfil_obter: dados do cliente logado, se é consultor e o e-mail da conta
  async perfil_obter(
    usuario_id: string
  ): Promise<{ cliente: Cliente | null; is_consultor: boolean; email: string }> {
    const admins = this.getAdmins();
    const is_consultor = admins.includes(usuario_id);

    const intUsers = this.getIntUsers();
    const user = intUsers.find((u) => u.user_id === usuario_id);
    const email = user ? user.email : '';

    const clientes = this.getClientes();
    const cliente = clientes.find((c) => c.usuario_id === usuario_id) || null;

    return { cliente, is_consultor, email };
  },

  // 2. perfil_salvar: cria ou atualiza o cadastro (upsert por usuario_id)
  async perfil_salvar(
    usuario_id: string,
    dados: { nome: string; telefone: string; cpf: string; email: string }
  ): Promise<Cliente> {
    const clientes = this.getClientes();
    const now = new Date().toISOString();
    const index = clientes.findIndex((c) => c.usuario_id === usuario_id);

    if (index >= 0) {
      clientes[index] = {
        ...clientes[index],
        nome: dados.nome.trim(),
        telefone: dados.telefone.trim(),
        cpf: dados.cpf.trim(),
        email: dados.email.trim(),
        atualizado_em: now,
      };
      this.setClientes(clientes);
      return clientes[index];
    } else {
      const nextId = clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1;
      const novoCliente: Cliente = {
        id: nextId,
        usuario_id,
        nome: dados.nome.trim(),
        telefone: dados.telefone.trim(),
        cpf: dados.cpf.trim(),
        email: dados.email.trim(),
        criado_em: now,
        atualizado_em: now,
      };
      clientes.push(novoCliente);
      this.setClientes(clientes);
      return novoCliente;
    }
  },

  // 3. empresa_obter: linha da empresa
  async empresa_obter(): Promise<Empresa> {
    return this.getEmpresa();
  },

  // 4. horarios_listar: sete dias
  async horarios_listar(): Promise<HorarioAtendimento[]> {
    return this.getHorarios().sort((a, b) => a.dia_semana - b.dia_semana);
  },

  // 5. produtos_listar: produtos ativos, ordenados por ordem
  async produtos_listar(): Promise<Produto[]> {
    return this.getProdutos()
      .filter((p) => p.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  },

  // 6. ocupados_listar: contagem por data e hora de pedidos PENDENTE e CONFIRMADO em um intervalo de datas
  async ocupados_listar(data_inicio: string, data_fim: string): Promise<OcupadoSlot[]> {
    const agendamentos = this.getAgendamentos();
    const map = new Map<string, number>();

    agendamentos.forEach((ag) => {
      if (
        (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') &&
        ag.data_agendada >= data_inicio &&
        ag.data_agendada <= data_fim
      ) {
        const key = `${ag.data_agendada}_${ag.hora}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });

    const result: OcupadoSlot[] = [];
    map.forEach((count, key) => {
      const [data_agendada, hora] = key.split('_');
      result.push({ data_agendada, hora, count });
    });

    return result;
  },

  // 7. agendamento_criar: cria o pedido se todas as condições do 3.2 forem verdadeiras
  async agendamento_criar(
    usuario_id: string,
    dados: {
      produto_id: number;
      data_agendada: string;
      hora: string;
      local_tipo: LocationType;
      cep?: string | null;
      logradouro?: string | null;
      numero?: string | null;
      complemento?: string | null;
      bairro?: string | null;
      cidade?: string | null;
      uf?: string | null;
      referencia?: string | null;
      observacao?: string | null;
    }
  ): Promise<Agendamento> {
    // 3.2.a: O usuário logado tem cadastro de cliente
    const clientes = this.getClientes();
    const cliente = clientes.find((c) => c.usuario_id === usuario_id);
    if (!cliente) {
      throw new Error('Você precisa completar o seu cadastro antes de agendar.');
    }

    // 3.2.b: O local é "PRESENCIAL" ou "DOMICILIO"
    if (dados.local_tipo !== 'PRESENCIAL' && dados.local_tipo !== 'DOMICILIO') {
      throw new Error('Local de atendimento inválido.');
    }

    const empresa = this.getEmpresa();
    const produtos = this.getProdutos();
    const produto = produtos.find((p) => p.id === dados.produto_id && p.ativo);
    if (!produto) {
      throw new Error('Produto selecionado não encontrado ou inativo.');
    }

    // 3.2.c: Se for em domicílio, o produto escolhido atende em domicílio e empresa atende
    if (dados.local_tipo === 'DOMICILIO') {
      if (!empresa.atende_domicilio) {
        throw new Error('A empresa não está realizando atendimento em domicílio no momento.');
      }
      if (!produto.atende_domicilio) {
        throw new Error('Este produto não disponibiliza atendimento em domicílio.');
      }
      if (!dados.logradouro || !dados.numero || !dados.bairro || !dados.cidade || !dados.uf) {
        throw new Error('O endereço completo é obrigatório para atendimento em domicílio.');
      }
    }

    // 3.2.d: O dia da semana da data está ativo na agenda de atendimento
    const [year, month, day] = dados.data_agendada.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const horarios = this.getHorarios();
    const horarioDia = horarios.find((h) => h.dia_semana === dayOfWeek);
    if (!horarioDia || !horarioDia.ativo) {
      throw new Error('Não há atendimento no dia da semana selecionado.');
    }

    // 3.2.e: O número de pedidos PENDENTE ou CONFIRMADO naquela data e hora é menor que as vagas por horário
    const agendamentos = this.getAgendamentos();
    const ocupadosNesseHorario = agendamentos.filter(
      (ag) =>
        ag.data_agendada === dados.data_agendada &&
        ag.hora === dados.hora &&
        (ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO')
    ).length;

    if (ocupadosNesseHorario >= empresa.vagas_por_horario) {
      throw new Error('Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.');
    }

    const nextId = agendamentos.length > 0 ? Math.max(...agendamentos.map((a) => a.id)) + 1 : 101;
    const now = new Date().toISOString();

    const novoAgendamento: Agendamento = {
      id: nextId,
      cliente_id: cliente.id,
      usuario_id,
      produto_id: produto.id,
      data_agendada: dados.data_agendada,
      hora: dados.hora,
      local_tipo: dados.local_tipo,
      cep: dados.cep || null,
      logradouro: dados.logradouro || null,
      numero: dados.numero || null,
      complemento: dados.complemento || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
      uf: dados.uf || null,
      referencia: dados.referencia || null,
      observacao: dados.observacao ? dados.observacao.slice(0, 400) : null,
      status: 'PENDENTE',
      nova_data: null,
      nova_hora: null,
      mensagem_consultor: null,
      criado_em: now,
      atualizado_em: now,
    };

    agendamentos.push(novoAgendamento);
    this.setAgendamentos(agendamentos);

    return novoAgendamento;
  },

  // 8. meus_agendamentos: pedidos do usuário logado, mais recentes primeiro, paginado
  async meus_agendamentos(
    usuario_id: string,
    id_filtro?: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ items: Agendamento[]; total: number }> {
    const agendamentos = this.getAgendamentos();
    const produtos = this.getProdutos();
    const docs = this.getDocumentos();

    let filtered = agendamentos.filter((a) => a.usuario_id === usuario_id);

    if (id_filtro) {
      filtered = filtered.filter((a) => a.id === id_filtro);
    }

    // Mais recentes primeiro (por criado_em DESC)
    filtered.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit).map((ag) => {
      const prod = produtos.find((p) => p.id === ag.produto_id);
      const fotos_count = docs.filter((d) => d.agendamento_id === ag.id).length;
      return {
        ...ag,
        produto: prod,
        fotos_count,
      };
    });

    return { items: paged, total };
  },

  // 9. agendamento_cancelar: cancelamento pelo dono
  async agendamento_cancelar(usuario_id: string, agendamento_id: number): Promise<Agendamento> {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex((a) => a.id === agendamento_id && a.usuario_id === usuario_id);
    if (index < 0) {
      throw new Error('Pedido não encontrado ou sem permissão para cancelar.');
    }

    const pedido = agendamentos[index];
    if (pedido.status !== 'PENDENTE' && pedido.status !== 'CONFIRMADO' && pedido.status !== 'SUGERIDO') {
      throw new Error('Este pedido não pode mais ser cancelado.');
    }

    pedido.status = 'CANCELADO';
    pedido.atualizado_em = new Date().toISOString();
    agendamentos[index] = pedido;
    this.setAgendamentos(agendamentos);

    return pedido;
  },

  // 10. sugestao_aceitar: aceite pelo dono
  async sugestao_aceitar(usuario_id: string, agendamento_id: number): Promise<Agendamento> {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex((a) => a.id === agendamento_id && a.usuario_id === usuario_id);
    if (index < 0) {
      throw new Error('Pedido não encontrado.');
    }

    const pedido = agendamentos[index];
    if (pedido.status !== 'SUGERIDO' || !pedido.nova_data || !pedido.nova_hora) {
      throw new Error('Não há novo horário sugerido para aceitar neste pedido.');
    }

    pedido.data_agendada = pedido.nova_data;
    pedido.hora = pedido.nova_hora;
    pedido.nova_data = null;
    pedido.nova_hora = null;
    pedido.status = 'CONFIRMADO';
    pedido.atualizado_em = new Date().toISOString();

    agendamentos[index] = pedido;
    this.setAgendamentos(agendamentos);

    return pedido;
  },

  // 11. documento_anexar: anexar foto ao pedido do dono, limite de 8 no total
  async documento_anexar(
    usuario_id: string,
    agendamento_id: number,
    foto: { nome?: string; conteudo: string }
  ): Promise<Documento> {
    const agendamentos = this.getAgendamentos();
    const pedido = agendamentos.find((a) => a.id === agendamento_id && a.usuario_id === usuario_id);
    if (!pedido) {
      throw new Error('Pedido não encontrado.');
    }

    const docs = this.getDocumentos();
    const pedidoDocs = docs.filter((d) => d.agendamento_id === agendamento_id);
    if (pedidoDocs.length >= 8) {
      throw new Error('Limite de fotos atingido neste pedido.');
    }

    const nextId = docs.length > 0 ? Math.max(...docs.map((d) => d.id)) + 1 : 1;
    const novoDoc: Documento = {
      id: nextId,
      agendamento_id,
      nome: foto.nome || `foto_${nextId}.jpg`,
      mime: 'image/jpeg',
      conteudo: foto.conteudo,
      criado_em: new Date().toISOString(),
    };

    docs.push(novoDoc);
    this.setDocumentos(docs);
    return novoDoc;
  },

  // 12. documentos_listar: fotos do pedido, para o dono ou consultor
  async documentos_listar(usuario_id: string, agendamento_id: number): Promise<Documento[]> {
    const admins = this.getAdmins();
    const isConsultor = admins.includes(usuario_id);

    const agendamentos = this.getAgendamentos();
    const pedido = agendamentos.find((a) => a.id === agendamento_id);
    if (!pedido) {
      throw new Error('Pedido não encontrado.');
    }

    if (!isConsultor && pedido.usuario_id !== usuario_id) {
      throw new Error('Sem permissão para ver os documentos deste pedido.');
    }

    const docs = this.getDocumentos();
    return docs.filter((d) => d.agendamento_id === agendamento_id);
  },

  // 13. admin_agendamentos: lista para consultores, com dados do cliente e contagem de fotos
  async admin_agendamentos(
    usuario_id: string,
    status_filtro?: string,
    id_filtro?: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ items: Agendamento[]; total: number }> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const agendamentos = this.getAgendamentos();
    const clientes = this.getClientes();
    const produtos = this.getProdutos();
    const docs = this.getDocumentos();

    let filtered = [...agendamentos];

    if (id_filtro) {
      filtered = filtered.filter((a) => a.id === id_filtro);
    } else if (status_filtro && status_filtro !== 'TODOS') {
      filtered = filtered.filter((a) => a.status === status_filtro);
    }

    // Ordenação: pedidos PENDENTE primeiro; dentro de cada grupo, por data e hora crescentes
    filtered.sort((a, b) => {
      const aIsPendente = a.status === 'PENDENTE' ? 0 : 1;
      const bIsPendente = b.status === 'PENDENTE' ? 0 : 1;
      if (aIsPendente !== bIsPendente) {
        return aIsPendente - bIsPendente;
      }
      const dateA = `${a.data_agendada}T${a.hora}`;
      const dateB = `${b.data_agendada}T${b.hora}`;
      return dateA.localeCompare(dateB);
    });

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit).map((ag) => {
      const cliente = clientes.find((c) => c.id === ag.cliente_id);
      const produto = produtos.find((p) => p.id === ag.produto_id);
      const fotos_count = docs.filter((d) => d.agendamento_id === ag.id).length;
      return {
        ...ag,
        cliente,
        produto,
        fotos_count,
      };
    });

    return { items: paged, total };
  },

  // 14. admin_contadores: quantidade de pedidos por status
  async admin_contadores(usuario_id: string): Promise<AdminCounters> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const agendamentos = this.getAgendamentos();
    let novos = 0;
    let confirmados = 0;
    let sugeridos = 0;

    agendamentos.forEach((a) => {
      if (a.status === 'PENDENTE') novos++;
      else if (a.status === 'CONFIRMADO') confirmados++;
      else if (a.status === 'SUGERIDO') sugeridos++;
    });

    return {
      novos,
      confirmados,
      sugeridos,
      todos: agendamentos.length,
    };
  },

  // 15. admin_decidir: confirmar, recusar ou sugerir (3.4)
  async admin_decidir(
    usuario_id: string,
    agendamento_id: number,
    acao: 'CONFIRMAR' | 'RECUSAR' | 'SUGERIR',
    recado?: string | null,
    nova_data?: string | null,
    nova_hora?: string | null
  ): Promise<Agendamento> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex((a) => a.id === agendamento_id);
    if (index < 0) {
      throw new Error('Pedido não encontrado.');
    }

    const pedido = agendamentos[index];
    if (pedido.status !== 'PENDENTE' && pedido.status !== 'CONFIRMADO' && pedido.status !== 'SUGERIDO') {
      throw new Error('Este pedido não está em aberto para decisão.');
    }

    const now = new Date().toISOString();
    pedido.mensagem_consultor = recado ? recado.slice(0, 400) : null;
    pedido.atualizado_em = now;

    if (acao === 'CONFIRMAR') {
      pedido.status = 'CONFIRMADO';
      pedido.nova_data = null;
      pedido.nova_hora = null;
    } else if (acao === 'RECUSAR') {
      pedido.status = 'RECUSADO';
      pedido.nova_data = null;
      pedido.nova_hora = null;
    } else if (acao === 'SUGERIR') {
      if (!nova_data || !nova_hora) {
        throw new Error('Para sugerir um novo horário, selecione o dia e a hora.');
      }
      pedido.status = 'SUGERIDO';
      pedido.nova_data = nova_data;
      pedido.nova_hora = nova_hora;
    }

    agendamentos[index] = pedido;
    this.setAgendamentos(agendamentos);

    return pedido;
  },

  // 16. admin_empresa_salvar: salva os dados e regras da empresa
  async admin_empresa_salvar(usuario_id: string, dados: Partial<Empresa>): Promise<Empresa> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const empresa = this.getEmpresa();
    const updated: Empresa = {
      ...empresa,
      ...dados,
      id: 1, // Sempre 1
      duracao_min: dados.duracao_min !== undefined ? Math.max(5, dados.duracao_min) : empresa.duracao_min,
      vagas_por_horario:
        dados.vagas_por_horario !== undefined ? Math.max(1, dados.vagas_por_horario) : empresa.vagas_por_horario,
      antecedencia_horas:
        dados.antecedencia_horas !== undefined ? Math.max(0, dados.antecedencia_horas) : empresa.antecedencia_horas,
    };

    this.setEmpresa(updated);
    return updated;
  },

  // 17. admin_horarios_salvar: salva os sete dias de uma vez
  async admin_horarios_salvar(usuario_id: string, horarios: HorarioAtendimento[]): Promise<HorarioAtendimento[]> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    if (!Array.isArray(horarios) || horarios.length !== 7) {
      throw new Error('A agenda deve conter exatamente os 7 dias da semana.');
    }

    // Validação: em dia ativo, o início deve ser antes do fim
    for (const h of horarios) {
      if (h.ativo && h.inicio >= h.fim) {
        throw new Error('A hora de início deve ser antes do fim.');
      }
    }

    this.setHorarios(horarios);
    return horarios;
  },

  // 18. admin_admins_listar: consultores com e-mail e indicação de qual é o usuário atual
  async admin_admins_listar(usuario_id: string): Promise<AdminUserItem[]> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const intUsers = this.getIntUsers();
    return admins.map((adminId) => {
      const user = intUsers.find((u) => u.user_id === adminId);
      return {
        usuario_id: adminId,
        email: user ? user.email : adminId,
        is_current: adminId === usuario_id,
      };
    });
  },

  // 19. admin_admin_adicionar: dá acesso de consultor a quem já entrou no app, pelo e-mail
  async admin_admin_adicionar(usuario_id: string, email: string): Promise<void> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const intUsers = this.getIntUsers();
    const targetUser = intUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      throw new Error('Não encontramos esse e-mail. A pessoa precisa entrar no aplicativo uma vez antes.');
    }

    if (!admins.includes(targetUser.user_id)) {
      admins.push(targetUser.user_id);
      this.setAdmins(admins);
    }
  },

  // 20. admin_admin_remover: remove o acesso de outro consultor
  async admin_admin_remover(usuario_id: string, alvo_usuario_id: string): Promise<void> {
    const admins = this.getAdmins();
    if (!admins.includes(usuario_id)) {
      throw new Error('Acesso restrito a consultores.');
    }

    if (alvo_usuario_id === usuario_id) {
      throw new Error('Você não pode remover seu próprio acesso de consultor.');
    }

    const updated = admins.filter((id) => id !== alvo_usuario_id);
    this.setAdmins(updated);
  },
};
