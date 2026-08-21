import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { MyIcon } from './MyIcon';
import { getUbicacion, getUbicacionByEmpresa } from '../../../actions/almacen/movimientosInternos/get-Ubicaciones';
import { Ubicacion } from '../../../domain/entities/almacen/movimientosInternos/ubicacion';

interface Props {
  /**
   * Pasa UNO de estos dos:
   *   - almacen → usa el endpoint nuevo /almacen/ubicacionesCmb/ (búsqueda por prefijo)
   *   - empresa → usa el endpoint legacy /configuracion/ubicaciones/ (match exacto)
   */
  almacen?: string;
  empresa?: string;
  onOpenChange?: (open: boolean) => void;
  value: string;
  onChangeText: (text: string) => void;
  onSelect?: (ubiid: string) => void;
  onSubmitEditing?: (text?: string) => void;
  placeholder?: string;
  iconName?: string;
  containerStyle?: ViewStyle;
  inputStyle?: 'search' | 'form';
  minChars?: number;
  editable?: boolean;
  hasError?: boolean;
  hasValid?: boolean;
}

export interface SelectUbicacionHandle {
  focus: () => void;
}

// Máximo de opciones a mostrar en el dropdown. Si el backend devuelve más,
// pedimos al usuario escribir más caracteres para filtrar (evita scroll
// interno anidado que causa problemas con el ScrollView del padre).
const MAX_RESULTS = 5;

export const SelectUbicacion = forwardRef<SelectUbicacionHandle, Props>(({
  almacen,
  empresa,
  onOpenChange,
  value,
  onChangeText,
  onSelect,
  onSubmitEditing,
  placeholder = 'Escribe para buscar una ubicación',
  iconName = 'pin-outline',
  containerStyle,
  inputStyle = 'search',
  minChars = 3,
  editable = true,
  hasError = false,
  hasValid = false,
}, ref) => {
  const [results, setResults] = useState<Ubicacion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextQueryRef = useRef(false);
  const inputRef = useRef<TextInput>(null);
  // Guardamos la longitud previa del value para saber si el usuario
  // está agregando o borrando caracteres. Si está borrando, evitamos
  // auto-seleccionar (para que pueda vaciar el input a mano).
  const prevLenRef = useRef(0);
  const isDeletingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const dropdownVisible =
    open && focused && value.trim().length >= minChars;
  useEffect(() => {
    onOpenChange?.(dropdownVisible);
  }, [dropdownVisible, onOpenChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Detecta si el usuario está borrando (nueva longitud < previa).
    const currentLen = value.length;
    isDeletingRef.current = currentLen < prevLenRef.current;
    prevLenRef.current = currentLen;

    if (skipNextQueryRef.current) {
      skipNextQueryRef.current = false;
      return;
    }

    if (!focused) return;
    if (!almacen && !empresa) return;
    if (!value || value.trim().length < minChars) {
      setResults([]);
      setTotalCount(0);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = almacen
          ? await getUbicacion(almacen, value.trim())
          : await getUbicacionByEmpresa(empresa as string, value.trim());
        const valid = (items || []).filter((it) => it.ubiid);
        setTotalCount(valid.length);
        // Mostramos solo los primeros MAX_RESULTS. Evita scroll interno.
        setResults(valid.slice(0, MAX_RESULTS));

        // Auto-selección solo si el usuario está AGREGANDO caracteres
        // (no cuando está borrando), y si el texto hace match exacto.
        if (!isDeletingRef.current) {
          const target = value.trim().toUpperCase();
          const exact = valid.find(
            it => String(it.ubiid).trim().toUpperCase() === target,
          );
          if (exact) {
            handleSelect(exact.ubiid as string);
          }
        }
      } catch (e) {
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, almacen, empresa, focused, minChars]);

  const handleSelect = (ubiid: string) => {
    skipNextQueryRef.current = true;
    onChangeText(ubiid);
    onSelect?.(ubiid);
    setOpen(false);
    setResults([]);
    setTotalCount(0);
    // Cierra el teclado al seleccionar (por tap del dropdown o por
    // auto-selección de match exacto). El input pierde el foco también.
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const isForm = inputStyle === 'form';
  const hayMasResultados = totalCount > MAX_RESULTS;

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      <View
        style={[
          isForm ? styles.formWrap : styles.searchWrap,
          hasError && styles.errorWrap,
          hasValid && styles.validWrap,
        ]}>
        {!isForm && <MyIcon name={iconName} size={18} />}
        <TextInput
          ref={inputRef}
          style={isForm ? styles.formInput : styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={hasError ? '#EF4444' : '#94A3B8'}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 350)}
          onSubmitEditing={e => onSubmitEditing?.(e?.nativeEvent?.text ?? value)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />
        {loading && <ActivityIndicator size="small" color="#2563EB" />}
      </View>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.emptyRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.emptyText}>Cargando...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyRow}>
              <MyIcon name="alert-circle-outline" size={16} />
              <Text style={styles.emptyText}>No se encontró ubicación</Text>
            </View>
          ) : (
            <>
              {results.map((item, i) => (
                <TouchableOpacity
                  key={`${item.ubiid}-${i}`}
                  activeOpacity={0.7}
                  style={styles.optionRow}
                  onPress={() => handleSelect(item.ubiid as string)}
                >
                  <MyIcon name="pin-outline" size={14} />
                  <Text style={styles.optionText}>{item.ubiid}</Text>
                  {item.ubialmid ? (
                    <Text style={styles.optionMeta}>{item.ubialmid}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {hayMasResultados && (
                <View style={styles.moreRow}>
                  <MyIcon name="search-outline" size={12} />
                  <Text style={styles.moreText}>
                    Hay {totalCount - MAX_RESULTS} más — escribe otro
                    carácter para filtrar
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 6,
    padding: 0,
  },
  formWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  formInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  errorWrap: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  validWrap: {
    borderColor: '#16A34A',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 9999,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  moreText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
});
