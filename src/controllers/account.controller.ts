import { Request, Response } from 'express';
import { AccountRepository } from '../core/repositories/AccountRepository';

const accountRepository = new AccountRepository();

export const createAccount = async (req: Request, res: Response) => {
  try {
    const account = await accountRepository.create(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create account' });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountRepository.findAll();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await accountRepository.findById(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

export const updateAccountStatus = async (req: Request, res: Response) => {
  try {
    const account = await accountRepository.updateStatus(req.params.id, req.body.status);
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update account status' });
  }
};