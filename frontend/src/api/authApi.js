import axiosClient from './axiosClient';

export const signup = async (data) => {
  const res = await axiosClient.post('/auth/signup', data);
  return res.data;
};

export const login = async (data) => {
  const res = await axiosClient.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await axiosClient.get('/auth/me');
  return res.data;
};