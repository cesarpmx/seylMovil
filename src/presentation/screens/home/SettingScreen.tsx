import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Layout} from '@ui-kitten/components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MyIcon} from '../../components/ui/MyIcon';
import {
  AuthMode,
  getAuthMode,
  getBasicConfig,
  getBearerConfig,
} from '../../../config/api/authMode';
import {RootStackParams} from '../../navigation/StackNavigator';
import {useAuthStore} from '../../store/modules/useModulesStore';

export const SettingScreen = () => {
  const [mode, setMode] = useState<AuthMode>(getAuthMode());
  const [host, setHost] = useState<string>('');
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const {usunombre} = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      const current = getAuthMode();
      setMode(current);
      setHost(
        current === 'bearer'
          ? getBearerConfig().apiHostUrl
          : getBasicConfig().apiUrl,
      );
    }, []),
  );

  const isBearer = mode === 'bearer';

  return (
    <Layout style={{flex: 1, backgroundColor: '#F8FAFC'}}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIcon}>
            <MyIcon name="settings-2-outline" size={22} white />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.pageTitle}>Configuración</Text>
            <Text style={styles.pageSubtitle}>
              Ajustes y estado del dispositivo
            </Text>
          </View>
        </View>

        {/* Status card */}
        <View
          style={[
            styles.statusCard,
            isBearer ? styles.statusCardBearer : styles.statusCardBasic,
          ]}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconWrap,
                isBearer
                  ? styles.statusIconWrapBearer
                  : styles.statusIconWrapBasic,
              ]}>
              <MyIcon
                name={isBearer ? 'shield-outline' : 'lock-outline'}
                size={22}
                white
              />
            </View>
            <View style={{flex: 1}}>
              <View style={styles.statusPillRow}>
                <View
                  style={[
                    styles.statusDot,
                    isBearer ? styles.statusDotBearer : styles.statusDotBasic,
                  ]}
                />
                <Text style={styles.statusPillLabel}>CONECTADO</Text>
              </View>
              <Text style={styles.statusTitle}>
                {isBearer ? 'Bearer Token' : 'Basic Auth'}
              </Text>
              <Text style={styles.statusHint}>
                {isBearer
                  ? 'Oracle Cloud · OAuth client_credentials'
                  : 'Autenticación por usuario y contraseña'}
              </Text>
            </View>
          </View>
          {!!host && (
            <View style={styles.statusHostBox}>
              <MyIcon name="globe-outline" size={13} />
              <Text style={styles.statusHost} numberOfLines={1}>
                {host}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0 · Seyl Almacenes</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pageHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Status card
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  statusCardBearer: {
    backgroundColor: '#ECFEFF',
    borderColor: '#5EEAD4',
    shadowColor: '#0F766E',
  },
  statusCardBasic: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    shadowColor: '#1D4ED8',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  statusIconWrapBearer: {
    backgroundColor: '#0F766E',
    shadowColor: '#0F766E',
  },
  statusIconWrapBasic: {
    backgroundColor: '#1D4ED8',
    shadowColor: '#1D4ED8',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusDotBearer: {backgroundColor: '#0F766E'},
  statusDotBasic: {backgroundColor: '#1D4ED8'},
  statusPillLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusHint: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  statusHostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
  },
  statusHost: {
    fontSize: 11,
    color: '#334155',
    fontFamily: 'Courier',
    flex: 1,
    fontWeight: '600',
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.2,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
