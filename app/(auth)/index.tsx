/**
 * Welcome/Signup Screen - First screen users see
 */

import { Button, DisclaimerModal } from "@/components/common";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants";
import { useSettingsStore, useUserStore } from "@/store";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
	const router = useRouter();
	const { user, isAuthenticated } = useUserStore();
	const { disclaimerAccepted, acceptDisclaimer } = useSettingsStore();
	const [showDisclaimer, setShowDisclaimer] = useState(false);

	useEffect(() => {
		// If already authenticated, redirect to main app
		if (isAuthenticated && user) {
			setTimeout(() => {
				router.replace("/(tabs)");
			}, 0);
		}
	}, [isAuthenticated, user, router]);

	const handleGetStarted = () => {
		if (!disclaimerAccepted) {
			setShowDisclaimer(true);
		} else {
			router.push("/(auth)/profile-setup");
		}
	};

	const handleAcceptDisclaimer = () => {
		acceptDisclaimer();
		setShowDisclaimer(false);
		router.push("/(auth)/profile-setup");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.logo}>🌾</Text>
				<Text style={styles.title}>Rice Quality</Text>
				<Text style={styles.subtitle}>Analyzer</Text>
			</View>

			<View style={styles.features}>
				<FeatureItem
					icon="📸"
					title="Capture"
					description="Take a photo of your rice sample"
				/>
				<FeatureItem
					icon="🤖"
					title="Analyze"
					description="AI analyzes grain quality instantly"
				/>
				<FeatureItem
					icon="📊"
					title="Results"
					description="Get detailed quality metrics"
				/>
			</View>

			<View style={styles.footer}>
				<Button
					title="Get Started"
					onPress={handleGetStarted}
					fullWidth
					size="lg"
				/>
				<Text style={styles.footerText}>Powered by UNIDO & AfricaRice</Text>
			</View>

			<DisclaimerModal
				visible={showDisclaimer}
				onAccept={handleAcceptDisclaimer}
			/>
		</View>
	);
}

function FeatureItem({
	icon,
	title,
	description,
}: {
	icon: string;
	title: string;
	description: string;
}) {
	return (
		<View style={styles.featureItem}>
			<Text style={styles.featureIcon}>{icon}</Text>
			<View style={styles.featureText}>
				<Text style={styles.featureTitle}>{title}</Text>
				<Text style={styles.featureDescription}>{description}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
		paddingHorizontal: Spacing.lg,
		paddingTop: 100,
	},
	header: {
		alignItems: "center",
		marginBottom: Spacing.xxl,
	},
	logo: {
		fontSize: 80,
		marginBottom: Spacing.md,
	},
	title: {
		fontSize: 32,
		fontWeight: FontWeight.bold,
		color: Colors.light.primary,
	},
	subtitle: {
		fontSize: 32,
		fontWeight: FontWeight.bold,
		color: Colors.light.text,
	},
	features: {
		flex: 1,
		justifyContent: "center",
	},
	featureItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.xl,
	},
	featureIcon: {
		fontSize: 40,
		marginRight: Spacing.md,
	},
	featureText: {
		flex: 1,
	},
	featureTitle: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.semibold,
		color: Colors.light.text,
		marginBottom: 2,
	},
	featureDescription: {
		fontSize: FontSize.md,
		color: Colors.light.textSecondary,
	},
	footer: {
		paddingBottom: Spacing.xxl,
	},
	footerText: {
		textAlign: "center",
		marginTop: Spacing.md,
		fontSize: FontSize.sm,
		color: Colors.light.textMuted,
	},
});
