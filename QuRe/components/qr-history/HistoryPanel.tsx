import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useQRCode } from '@/context/QRCodeContext';
import { QRCodeItem } from '@/context/QRCodeTypes';
import { QRCodeGenerator } from '@/components/qr-base';

interface HistoryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectQRCode: (qrCode: QRCodeItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isVisible,
  onClose,
  onSelectQRCode,
}) => {
  const { qrCodes } = useQRCode();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const subtextColor = useThemeColor({ light: '#666', dark: '#999' }, 'icon');

  const qrCodeList = React.useMemo(() => {
    return Object.values(qrCodes)
      .filter(qrCode => 
        // Filter out the QuRe app QR code and default placeholder
        qrCode.id !== 'qure-app' && qrCode.id !== 'user-default'
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [qrCodes]);

  const getQRTypeIcon = (type: string): string => {
    const typeIcons: Record<string, string> = {
      link: '🔗',
      email: '✉️',
      call: '📞',
      sms: '💬',
      vcard: '📇',
      whatsapp: '📱',
      text: '📝'
    };
    
    return typeIcons[type] || '🔗';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderQRCodeItem = ({ item }: { item: QRCodeItem }) => (
    <TouchableOpacity 
      style={[styles.qrItem, { borderBottomColor: borderColor }]}
      onPress={() => {
        onSelectQRCode(item);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.qrPreview}>
        <QRCodeGenerator 
          value={getQRCodeValue(item)}
          size={50}
          color={item.styleOptions.color}
          backgroundColor={item.styleOptions.backgroundColor}
          enableLinearGradient={item.styleOptions.enableLinearGradient}
          linearGradient={item.styleOptions.linearGradient}
          quietZone={0}
        />
      </View>
      <View style={styles.qrInfo}>
        <Text style={[styles.qrLabel, { color: textColor }]}>{item.label}</Text>
        <View style={styles.qrDetails}>
          <Text style={[styles.qrType, { color: subtextColor }]}>
            {getQRTypeIcon(item.type)} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={[styles.qrDate, { color: subtextColor }]}>
            {formatDate(item.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getQRCodeValue = (qrCode: QRCodeItem): string => {
    switch (qrCode.type) {
      case 'link':
        return qrCode.data.url;
      case 'email':
        return `mailto:${qrCode.data.email}`;
      case 'call':
        return `tel:${qrCode.data.phoneNumber}`;
      case 'text':
        return qrCode.data.content;
      default:
        return 'https://example.com';
    }
  };

  // Check if there are actually user-created QR codes to show
  const hasHistory = qrCodeList.length > 0;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[styles.panel, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>QR Code History</Text>
            <TouchableOpacity 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          {!hasHistory ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={subtextColor} />
              <Text style={[styles.emptyText, { color: textColor }]}>
                No QR codes in history
              </Text>
              <Text style={[styles.emptySubtext, { color: subtextColor }]}>
                Create a QR code to see it here
              </Text>
            </View>
          ) : (
            <FlatList
              data={qrCodeList}
              renderItem={renderQRCodeItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Platform.OS === 'android' ? '85%' : '80%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    flexGrow: 1,
  },
  qrItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  qrPreview: {
    marginRight: 16,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  qrInfo: {
    flex: 1,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  qrDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrType: {
    fontSize: 14,
  },
  qrDate: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default HistoryPanel;