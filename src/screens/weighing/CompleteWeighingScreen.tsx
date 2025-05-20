// src/screens/weighing/CompleteWeighingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { formatDate, formatTime } from "@/utils/formatters";
import { WeighingStackParamList } from "@/types/navigation.types";
import { Phieucan, PhieucanComplete } from "@/types/api.types";

type CompleteWeighingRouteProp = RouteProp<
  WeighingStackParamList,
  "CompleteWeighing"
>;

const CompleteWeighingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CompleteWeighingRouteProp>();
  const { userInfo } = useAuth();
  const { colors } = useAppTheme();

  const { weighingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [weighing, setWeighing] = useState<Phieucan | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadWeighingData();
  }, []);

  const loadWeighingData = async () => {
    try {
      setLoading(true);
      const response = await weighingApi.getWeighingById(weighingId);
      if (response.success) {
        setWeighing(response.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải thông tin phiếu cân");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Load weighing error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin phiếu cân");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setWeight(numericValue);

    if (error) {
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!weight || Number(weight) <= 0) {
      setError("Vui lòng nhập trọng lượng hợp lệ");
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const completeData: PhieucanComplete = {
        tlcan2: Number(weight),
        // ngaycan2 is optional and will be set to the current time on the server
      };

      const response = await weighingApi.completeWeighing(
        weighingId,
        completeData,
      );

      if (response.success) {
        Alert.alert("Thành công", "Hoàn thành cân thành công", [
          {
            text: "Xem chi tiết",
            onPress: () => {
              // @ts-ignore
              navigation.navigate("WeighingDetail", {
                weighing: response.data,
              });
            },
          },
          {
            text: "Về danh sách",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi hoàn thành cân");
      }
    } catch (error) {
      console.error("Complete weighing error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi hoàn thành cân");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading || !weighing) {
    return <Loading loading={true} fullscreen />;
  }

  return (
    <ThemedView useSafeArea>
      <Header title="Hoàn Thành Cân" showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ThemedText style={styles.title}>Nhập trọng lượng cân ra</ThemedText>

        <Card style={styles.weighingInfoCard}>
          <View style={styles.vehicleInfo}>
            <View
              style={[
                styles.vehicleIconContainer,
                { backgroundColor: colors.gray100 },
              ]}
            >
              <Ionicons name="car" size={24} color={colors.primary} />
            </View>
            <ThemedText style={styles.vehicleNumber}>
              {weighing.soxe}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.ticketNumber}>
              #{weighing.sophieu}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText type="subtitle" style={styles.infoLabel}>
              Khách hàng:
            </ThemedText>
            <ThemedText style={styles.infoValue}>
              {weighing.khachhang}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText type="subtitle" style={styles.infoLabel}>
              Loại hàng:
            </ThemedText>
            <ThemedText style={styles.infoValue}>
              {weighing.loaihang}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText type="subtitle" style={styles.infoLabel}>
              Cân vào:
            </ThemedText>
            <ThemedText style={styles.infoValue}>
              {formatDate(weighing.ngaycan1)} {formatTime(weighing.ngaycan1)}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText type="subtitle" style={styles.infoLabel}>
              Trọng lượng vào:
            </ThemedText>
            <ThemedText style={styles.infoValue}>
              {weighing.tlcan1} kg
            </ThemedText>
          </View>
        </Card>

        <View style={styles.weighInputContainer}>
          <Input
            label="Trọng lượng cân ra (kg)"
            value={weight}
            onChangeText={handleWeightChange}
            error={error}
            keyboardType="numeric"
            leftIcon={
              <Ionicons name="scale-outline" size={24} color={colors.gray600} />
            }
            containerStyle={styles.weightInput}
            autoFocus
          />

          {weight && Number(weight) > 0 && weighing.tlcan1 && (
            <Card
              style={{
                ...styles.resultCard,
                backgroundColor: colors.success + "10",
              }}
            >
              <ThemedText style={styles.resultLabel}>
                Trọng lượng hàng:
              </ThemedText>
              <ThemedText
                style={[styles.resultValue, { color: colors.success }]}
              >
                {Math.abs(Number(weight) - weighing.tlcan1)} kg
              </ThemedText>
            </Card>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Hủy"
            variant="outline"
            onPress={handleCancel}
            contentStyle={styles.cancelButton}
          />

          <Button
            title="Hoàn thành"
            variant="success"
            onPress={handleComplete}
            loading={submitting}
            icon={
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="white"
              />
            }
            contentStyle={styles.completeButton}
          />
        </View>
      </ScrollView>

      <Loading loading={submitting} overlay message="Đang xử lý..." />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  weighingInfoCard: {
    marginBottom: 24,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  ticketNumber: {
    fontSize: 14,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  weighInputContainer: {
    marginBottom: 24,
  },
  weightInput: {
    marginBottom: 16,
  },
  resultCard: {
    padding: 16,
  },
  resultLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  completeButton: {
    flex: 2,
    marginLeft: 8,
  },
});

export default CompleteWeighingScreen;
