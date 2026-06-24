import axiosClient from './axiosClient';

export const getEvents = async (params = {}) => {
  // params can include: page, limit, search, category
  const res = await axiosClient.get('/events', { params });
  return res.data;
};

export const getEventById = async (id) => {
  const res = await axiosClient.get(`/events/${id}`);
  return res.data;
};

export const createEvent = async (data) => {
  const res = await axiosClient.post('/events', data);
  return res.data;
};

export const updateEvent = async (id, data) => {
  const res = await axiosClient.put(`/events/${id}`, data);
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await axiosClient.delete(`/events/${id}`);
  return res.data;
};