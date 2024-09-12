const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class EntregadorController {
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

  static async updateEntregador(req, res) {
    try {
      const { id } = req.params;
      const entregador = await prisma.entregador.update({
        where: { id: parseInt(id) },
        data: req.body,
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar entregador' });
    }
  }

  static async deleteEntregador(req, res) {
    try {
      const { id } = req.params;
      await prisma.entregador.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir entregador' });
    }
  }

  static async getEntregador(req, res) {
    try {
      const { id } = req.params;
      const entregador = await prisma.entregador.findUnique({
        where: { id: parseInt(id) },
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter entregador' });
    }
  }

  static async definirDisponibilidade(req, res) {
    try {
      const { id } = req.params;
      const entregador = await prisma.entregador.update({
        where: { id: parseInt(id) },
        data: { disponivel: req.body.disponivel },
      });
      res.status(200).json(entregador);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao definir disponibilidade' });
    }
  }

  static async register(req, res) {
    try {
      const { nome, senha, placaVeiculo, tipoVeiculo } = req.body;

      // Verifica se o entregador já existe
      const existingDeliverer = await prisma.entregador.findUnique({
        where: { nome }
      });
      if (existingDeliverer) {
        return res.status(400).json({ error: 'Entregador já existe' });
      }

      // Cria um hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Cria o novo entregador
      const entregador = await prisma.entregador.create({
        data: { nome, senha: hashedPassword, placaVeiculo, tipoVeiculo },
      });

      // Gera um token JWT
      const token = jwt.sign({ id: entregador.id }, 'SECRET_KEY', { expiresIn: '1h' });

      res.status(201).json({ entregador, token });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registrar entregador' });
    }
  }

  static async login(req, res) {
    try {
      const { nome, senha } = req.body;

      // Busca o entregador
      const entregador = await prisma.entregador.findUnique({
        where: { nome }
      });

      if (!entregador || !(await bcrypt.compare(senha, entregador.senha))) {
        return res.status(401).json({ error: 'Nome ou senha incorretos' });
      }

      // Gera um token JWT
      const token = jwt.sign({ id: entregador.id }, 'SECRET_KEY', { expiresIn: '1h' });

      res.status(200).json({ entregador, token });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

}

module.exports = EntregadorController;
