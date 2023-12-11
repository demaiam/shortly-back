import { urlsRepository } from "../repositories/urls.repository.js";
import { usersRepository } from "../repositories/users.repository.js";

import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

async function signUp(name, email, password, confirmPassword) {
  if (password !== confirmPassword) throw unprocessableEntityError('Passwords do not match');

  const user = await usersRepository.getUser(email);
  if (user.rowCount) throw conflictError('E-mail already in use');

  const hash = bcrypt.hashSync(password, 10);

  await usersRepository.signUp(name, email, hash);
}

async function signIn(email, password) {
  const user = await usersRepository.getUser(email);
  if (!user.rowCount) throw notFoundError('User');

  const isPasswordCorrect = bcrypt.compareSync(password, user.rows[0].password);
  if (!isPasswordCorrect) throw unauthorizedError('Incorrect password');

  await usersRepository.deleteSession(user.rows[0].id);

  const token = uuid();
  await usersRepository.signIn(user.rows[0].id, token);

  return { token: token };
}

async function getUserInfo(token) {
  const user = await usersRepository.getUserInfo(token);
  if (!user.rowCount) throw unauthorizedError('Failed to get user data');

  const urls = await urlsRepository.getUrlData(user.rows[0].id);

  const formattedObj = {
    ...user,
    shortenedUrls: urls.rows.map(url => ({
      id: url.id,
      url: url.url,
      shortUrl: url.shortUrl,
      visitCount: url.visitCount
    }))
  };

  return formattedObj;
}

async function getRanking() {
  const ranking = await usersRepository.getRanking();

  return ranking;
}

export const usersService = {
  signUp,
  signIn,
  getUserInfo,
  getRanking
};