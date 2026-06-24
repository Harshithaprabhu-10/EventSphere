import axiosClient from './axiosClient';

export const registerForEvent = async (eventId) => {
  const res = await axiosClient.post(`/registrations/${eventId}`);
  return res.data;
};

export const getMyRegistrations = async () => {
  const res = await axiosClient.get('/registrations/me');
  return res.data;
};

export const cancelRegistration = async (id) => {
  const res = await axiosClient.delete(`/registrations/${id}`);
  return res.data;
};

export const getRegistrationQRCode = async (id) => {
  const res = await axiosClient.get(`/registrations/${id}/qrcode`);
  return res.data;
};

export const checkInAttendee = async (qrToken) => {
  const res = await axiosClient.post('/registrations/checkin', { qrToken });
  return res.data;
};