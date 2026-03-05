import React from 'react';
import {
  Divider,
  Layout,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {MyIcon} from '../components/ui/MyIcon';

interface Props {
  title: string;
  subTitle?: string;
  rightAction?: () => void;
  rightActionIcon?: string;
  children: React.ReactNode;
}

export const MainLayout = ({
  title,
  subTitle,
  rightAction,
  rightActionIcon,
  children,
}: Props) => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();

  // Botón para abrir el menú o retroceder
  const renderLeftAction = () => {
    if (navigation.canGoBack()) {
      return (
        <TopNavigationAction
          onPress={() => navigation.goBack()}
          icon={<MyIcon name="arrow-back-outline" />} // Icono de retroceso
        />
      );
    }
    return (
      <TopNavigationAction
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        icon={
          <MyIcon name="menu-outline" />
        } // Icono de menú
      />
    );
  };

  // Botón derecho dinámico (si existe)
  const renderRightAction = () => {
    if (!rightAction || !rightActionIcon) return null;
    return (
      <TopNavigationAction
        onPress={rightAction}
        icon={<MyIcon name={rightActionIcon} />}
      />
    );
  };

  return (
    <Layout style={{paddingTop: top, flex: 1}}>
      <TopNavigation
        title={title}
        subtitle={subTitle}
        alignment="center"
        accessoryLeft={renderLeftAction} // Botón dinámico: menú o retroceso
        accessoryRight={renderRightAction} // Botón derecho si existe
      />
      <Divider />

      <Layout style={{flex: 1}}>{children}</Layout>
    </Layout>
  );
};
