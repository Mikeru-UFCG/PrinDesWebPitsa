const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class EntregadorController {
  // Método para criar um novo entregador (usado internamente, não exposto publicamente)
  static async createEntregador(req, res) {
    try {
      const entregador = await prisma.entregador.create({
        data: req.body,
      });
      res.status(201).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar entregador' });
    }
  }

  // Método para atualizar dados do entregador
  static async updateEntregador(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o entregador autenticado está tentando alterar seus próprios dados
      if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const entregador = await prisma.entregador.update({
        where: { id: parseInt(id) },
        data: req.body,
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar entregador' });
    }
  }

  // Método para deletar entregador
  static async deleteEntregador(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o entregador autenticado está tentando deletar seus próprios dados
      if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await prisma.entregador.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir entregador' });
    }
  }

  // Método para obter informações de um entregador
  static async getEntregador(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o entregador autenticado está tentando obter seus próprios dados
      if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const entregador = await prisma.entregador.findUnique({
        where: { id: parseInt(id) },
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter entregador' });
    }
  }

  // Método para solicitar associação com um estabelecimento
static async solicitarAssociacao(req, res) {
  try {
    const { idEstabelecimento } = req.body; // O ID do estabelecimento que o entregador deseja se associar

    // Verifica se o entregador autenticado está fazendo a solicitação
    const entregadorId = req.user.id;

    // Cria uma nova solicitação de associação
    const solicitacao = await prisma.associacao.create({
      data: {
        entregadorId: entregadorId,
        estabelecimentosId: idEstabelecimento,
        status: 'PENDENTE', // Define o status inicial como PENDENTE
      },
    });

    res.status(201).json(solicitacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao solicitar associação' });
  }
}

  // Definir a disponibilidade do entregador para fazer entregas
  static async definirDisponibilidade(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o entregador autenticado está tentando alterar sua disponibilidade
      if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const entregador = await prisma.entregador.update({
        where: { id: parseInt(id) },
        data: { disponivel: req.body.disponivel },
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao definir disponibilidade' });
    }
  }

  static async getEntregadores(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Página atual
      const limit = parseInt(req.query.limit) || 10; // Itens por página
      const skip = (page - 1) * limit;
  
      const entregadores = await prisma.entregador.findMany({
        skip: skip,
        take: limit,
      });
  
      // Contar o total de entregadores para fornecer informações sobre a paginação
      const totalEntregadores = await prisma.entregador.count();
  
      res.status(200).json({
        data: entregadores,
        meta: {
          total: totalEntregadores,
          page,
          pages: Math.ceil(totalEntregadores / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter entregadores' });
    }
  }

  // Registro de um novo entregador
static async register(req, res) {
  try {
    const { nome, codigoAcesso, placaVeiculo, tipoVeiculo, corVeiculo } = req.body;

    // Verificar se o entregador já existe
    const existingDeliverer = await prisma.entregador.findUnique({
      where: { nome }
    });
    if (existingDeliverer) {
      return res.status(400).json({ error: 'Entregador já existe' });
    }

    // Criar hash do código de acesso
    const hashedPassword = await bcrypt.hash(codigoAcesso, 10);

    // Criar novo entregador
    const entregador = await prisma.entregador.create({
      data: {
        nome,
        codigoAcesso: hashedPassword,
        placaVeiculo,
        tipoVeiculo,
        corVeiculo
      },
    });

    // Gerar token JWT com papel 'entregador'
    const token = jwt.sign({ id: entregador.id, role: 'entregador', nome }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

    res.status(201).json({ entregador, token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar entregador' });
  }
}

// Login do entregador
static async login(req, res) {
  try {
    const { nome, codigoAcesso } = req.body;

    // Buscar entregador no banco de dados
    const entregador = await prisma.entregador.findUnique({
      where: { nome }
    });

    if (!entregador || !(await bcrypt.compare(codigoAcesso, entregador.codigoAcesso))) {
      return res.status(401).json({ error: 'Nome ou código de acesso incorretos' });
    }

    // Gerar token JWT com papel 'entregador'
    const token = jwt.sign({ id: entregador.id, role: 'entregador', nome }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

    res.status(200).json({ entregador, token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}


}

module.exports = EntregadorController;
