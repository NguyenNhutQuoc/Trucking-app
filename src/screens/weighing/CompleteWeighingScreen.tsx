// src/screens/weighing/CompleteWeighingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="Hoàn Thành Cân" showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Nhập trọng lượng cân ra</Text>

        <Card style={styles.weighingInfoCard}>
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleIconContainer}>
              <Ionicons name="car" size={24} color={colors.primary} />
            </View>
            <Text style={styles.vehicleNumber}>{weighing.soxe}</Text>
            <Text style={styles.ticketNumber}>#{weighing.sophieu}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Khách hàng:</Text>
            <Text style={styles.infoValue}>{weighing.khachhang}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loại hàng:</Text>
            <Text style={styles.infoValue}>{weighing.loaihang}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cân vào:</Text>
            <Text style={styles.infoValue}>
              {formatDate(weighing.ngaycan1)} {formatTime(weighing.ngaycan1)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Trọng lượng vào:</Text>
            <Text style={styles.infoValue}>{weighing.tlcan1} kg</Text>
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
            <Card style={styles.resultCard}>
              <Text style={styles.resultLabel}>Trọng lượng hàng:</Text>
              <Text style={styles.resultValue}>
                {Math.abs(Number(weight) - weighing.tlcan1)} kg
              </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
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
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  ticketNumber: {
    fontSize: 14,
    color: colors.gray600,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  weighInputContainer: {
    marginBottom: 24,
  },
  weightInput: {
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: colors.success + "10",
    padding: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.gray700,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.success,
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
