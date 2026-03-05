import { Icon, useTheme } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface Props {
  name: string;
  color?: string;
  white?: boolean;
  size?: number;
}

export const MyIcon = ({ name, color, white = false, size = 32 }: Props) => {
  const theme = useTheme();

  // Determinar el color del icono
  if (white) {
    color = theme['color-info-100'];
  } else if (!color) {
    color = theme['text-basic-color'];
  } else {
    color = theme[color] ?? theme['text-basic-color'];
  }

  return (
    <Icon
      style={{ ...styles.icon, width: size, height: size }} // Ajuste dinámico del tamaño
      fill={color}
      name={name}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
  },
});
