import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { MyIcon } from './MyIcon';
import {
  ProductoBusquedaItem,
  searchProductos,
} from '../../../actions/almacen/inventario/search-productos';

interface Props {
  empresa: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect?: (producto: ProductoBusquedaItem) => void;
  onSubmitEditing?: (text: string, matched: boolean) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputStyle?: 'search' | 'form';
  minChars?: number;
  hasError?: boolean;
  hasValid?: boolean;
  editable?: boolean;
}

export interface SelectProductoHandle {
  focus: () => void;
}

export const SelectProducto = forwardRef<SelectProductoHandle, Props>(({
  empresa,
  value,
  onChangeText,
  onSelect,
  onSubmitEditing,
  placeholder = 'Clave o descripción (3 letras)',
  containerStyle,
  inputStyle = 'form',
  minChars = 3,
  hasError = false,
  hasValid = false,
  editable = true,
}, ref) => {
  const [results, setResults] = useState<ProductoBusquedaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextQueryRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (skipNextQueryRef.current) {
      skipNextQueryRef.current = false;
      return;
    }
    if (!focused) return;
    if (!empresa) return;
    if (!value || value.trim().length < minChars) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchProductos(empresa, value.trim());
        setResults(items);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, empresa, focused, minChars]);

  const handleSelect = (item: ProductoBusquedaItem) => {
    skipNextQueryRef.current = true;
    onChangeText(item.prdclave);
    onSelect?.(item);
    setOpen(false);
    setResults([]);
  };

  const handleSubmit = async (rawText?: string) => {
    const q = ((rawText ?? value) || '').trim();
    if (!q || !empresa) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    setOpen(true);
    try {
      const items = await searchProductos(empresa, q);
      setResults(items);
      const exact = items.find(
        it => (it.prdclave || '').toUpperCase() === q.toUpperCase(),
      );
      if (exact) {
        handleSelect(exact);
        onSubmitEditing?.(q, true);
      } else {
        onSubmitEditing?.(q, false);
      }
    } catch (e) {
      onSubmitEditing?.(q, false);
    } finally {
      setLoading(false);
    }
  };

  const isForm = inputStyle === 'form';

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      <View
        style={[
          isForm ? styles.formWrap : styles.searchWrap,
          hasError && styles.errorWrap,
          hasValid && styles.validWrap,
        ]}>
        {!isForm && <MyIcon name="cube-outline" size={18} />}
        <TextInput
          ref={inputRef}
          style={isForm ? styles.formInput : styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={hasError ? '#EF4444' : '#94A3B8'}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 350)}
          onSubmitEditing={e => handleSubmit(e?.nativeEvent?.text ?? value)}
          returnKeyType="search"
          autoCorrect={false}
          editable={editable}
        />
        {loading && <ActivityIndicator size="small" color="#2563EB" />}
      </View>

      {open && focused && value.trim().length >= minChars && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.emptyRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.emptyText}>Cargando...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyRow}>
              <MyIcon name="alert-circle-outline" size={16} />
              <Text style={styles.emptyText}>No se encontró producto</Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 260 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled>
              {results.map((item, i) => (
                <TouchableOpacity
                  key={`${item.prdid}-${i}`}
                  activeOpacity={0.7}
                  style={styles.optionRow}
                  onPressIn={() => handleSelect(item)}>
                  <MyIcon name="cube-outline" size={14} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionClave}>{item.prdclave}</Text>
                    <Text style={styles.optionNombre} numberOfLines={2}>
                      {item.prdnombre}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
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
  optionClave: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionNombre: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
});
