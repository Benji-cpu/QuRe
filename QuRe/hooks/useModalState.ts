import { useState } from 'react';
import * as Haptics from 'expo-haptics';

interface ModalStates {
  isEditModalVisible: boolean;
  isCreateQRModalVisible: boolean;
  isPremiumModalVisible: boolean;
}

interface ModalHandlers {
  openEditModal: () => void;
  closeEditModal: () => void;
  openCreateQRModal: () => void;
  closeCreateQRModal: () => void;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  handleSaveQR: (newValue: string) => void;
  handleUpgradePremium: () => void;
}

interface UseModalStateProps {
  onSaveQR: (value: string) => void;
  onUpgradePremium: () => void;
}

export const useModalState = ({ 
  onSaveQR, 
  onUpgradePremium 
}: UseModalStateProps): [ModalStates, ModalHandlers] => {
  // Modal visibility states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateQRModalVisible, setIsCreateQRModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);

  // Edit Modal handlers
  const openEditModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditModalVisible(true);
  };
  
  const closeEditModal = () => setIsEditModalVisible(false);

  // Create QR Modal handlers
  const openCreateQRModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsCreateQRModalVisible(true);
  };
  
  const closeCreateQRModal = () => setIsCreateQRModalVisible(false);
  
  const handleSaveQR = (newValue: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveQR(newValue);
    closeCreateQRModal(); 
  };

  // Premium Modal handlers
  const openPremiumModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPremiumModalVisible(true);
  };
  
  const closePremiumModal = () => setIsPremiumModalVisible(false);
  
  const handleUpgradePremium = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUpgradePremium();
    closePremiumModal();
  };

  const modalStates: ModalStates = {
    isEditModalVisible,
    isCreateQRModalVisible,
    isPremiumModalVisible
  };

  const modalHandlers: ModalHandlers = {
    openEditModal,
    closeEditModal,
    openCreateQRModal,
    closeCreateQRModal,
    openPremiumModal,
    closePremiumModal,
    handleSaveQR,
    handleUpgradePremium
  };

  return [modalStates, modalHandlers];
};

export default useModalState;