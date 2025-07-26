import { PIPE_COLORS } from '../constants/pipeColors';

export const getPipeColorByCode = (code: string) => {
  return PIPE_COLORS.find(color => color.code === code);
};

export const getPipeColorValue = (code: string) => {
  const color = getPipeColorByCode(code);
  return color ? color.value : '#333';
};

export const getAllPipeColors = () => {
  return PIPE_COLORS;
};