"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMainScreen } from "@/lib/contexts/MainScreenContext";
import { createAllApologyMessages } from "@/lib/utils/apologyMessages";
import { handleError } from "@/lib/utils/errorHandler";
import { retryWithBackoff } from "@/lib/utils/networkMonitor";
import { OpeningDialogue } from "./OpeningDialogue";
import { SpeechBubble } from "./SpeechBubble";
import { ThinkingAnimation } from "./ThinkingAnimation";

/**
 * DiscussionStageコンポーネントのプロパティ
 */
export interface DiscussionStageProps {
  /** アップロードされた画像ファイル */
  uploadedImage: File | null;
}

/**
 * ファイルをBase64文字列に変換する
 *
 * @param file - 変換するファイル
 * @returns Base64文字列（data:image/jpeg;base64,の部分を除去したもの）
 *
 * @remarks
 * FileReaderを使用してファイルをBase64エンコードする。
 * 画像解析APIに送信するため、data URLのプレフィックスを除去する。
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64, の部分を除去
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 評議員のインデックスに応じた吹き出しの位置を取得
 *
 * @param index - 評議員のインデックス（0-3）
 * @returns 吹き出しの位置
 */
function getSpeechBubblePosition(
  index: number,
): "topLeft" | "topRight" | "bottomLeft" | "bottomRight" {
  const positions: Array<
    "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  > = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  return positions[index % 4];
}

/**
 * 議論ステージコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns 議論ステージコンポーネント
 *
 * @remarks
 * - Motionを使用したアニメーション設定
 * - 評議員の待機位置と議論位置を定義
 * - 要件: 4.3
 *
 * @TSDoc
 * このコンポーネントは、評議員が議論を行うステージを提供します。
 * 画像を中央に配置し、評議員を四隅に配置します。
 */
export function DiscussionStage({ uploadedImage }: DiscussionStageProps) {
  const { state, actions, addToast } = useMainScreen();
  const { evaluators, discussionPhase, discussionLog } = state;
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  /**
   * ウィンドウサイズの変更を監視
   */
  useEffect(() => {
    // 初期サイズを設定
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // リサイズイベントのハンドラー
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * 全評議員のOpening Dialogueを収集
   */
  const allOpeningDialogues = useMemo(() => {
    const dialogues: string[] = [];
    for (const evaluator of evaluators) {
      dialogues.push(...evaluator.openingDialogues);
    }
    return dialogues;
  }, [evaluators]);

  /**
   * 評議員のインデックスに応じた四隅の位置を取得
   * 画面サイズに応じて相対的な位置を計算する
   *
   * @param index - 評議員のインデックス（0-3）
   * @returns 四隅の位置
   *
   * @remarks
   * 画面サイズに応じて動的に位置を計算することで、
   * 評議員が画面外に配置されることを防ぐ
   * 中央の画像（384px）+ 評議員のサイズ（96px）+ マージン（40px）を考慮
   */
  const getCornerPosition = useMemo(
    () =>
      (index: number): { x: number; y: number } => {
        // 利用可能な幅を計算（画面幅 - サイドバー320px - 中央コンテンツ余白）
        const availableWidth = windowSize.width - 320 - 100;
        // 中央画像の半分（192px）+ 評議員の半分（48px）+ マージン（30px）
        const minDistance = 192 + 48 + 30;
        // 利用可能な幅の40%を基準とし、最小値と最大値を設定
        const baseDistance = Math.min(
          Math.max(availableWidth * 0.4, minDistance),
          280,
        );

        const positions = [
          { x: -baseDistance, y: -baseDistance * 0.65 }, // 左上
          { x: baseDistance, y: -baseDistance * 0.65 }, // 右上
          { x: -baseDistance, y: baseDistance * 0.65 }, // 左下
          { x: baseDistance, y: baseDistance * 0.65 }, // 右下
        ];

        return positions[index % 4];
      },
    [windowSize.width],
  );

  /**
   * 移動完了後にOpening Dialogueフェーズに移行
   */
  useEffect(() => {
    if (discussionPhase === "moving") {
      // 移動アニメーションの時間（1.5秒）後にopeningフェーズに移行
      const timer = setTimeout(() => {
        actions.setDiscussionPhase("opening");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [discussionPhase, actions]);

  /**
   * Thinking Phase開始時に画像解析を実行
   * 要件: 2.2, 4.11, 4.12
   */
  useEffect(() => {
    if (discussionPhase === "thinking" && uploadedImage) {
      // 画像解析処理を並行実行
      const analyzeImage = async () => {
        try {
          // 画像をBase64に変換
          const imageBase64 = await fileToBase64(uploadedImage);

          // 画像解析APIを呼び出す（要件: 2.1, 10.6）
          // リトライ機能付きでAPIリクエストを実行
          await retryWithBackoff(
            async () => {
              const response = await fetch("/api/analyze-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageBase64 }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                // HTTPエラーをステータスコード付きでスロー
                const error = new Error(
                  errorData.error || "画像解析に失敗しました",
                ) as Error & { status: number };
                error.status = response.status;
                throw error;
              }

              return response.json();
            },
            {
              onRetry: (attempt, maxRetries) => {
                // リトライ時に警告トーストを表示（要件: 10.6）
                addToast.warning(
                  `接続に失敗しました。リトライ中... (${attempt}/${maxRetries})`,
                  {
                    description: "ネットワーク接続を確認してください。",
                  },
                );
              },
            },
          );

          // 画像解析結果をコンテキストに保存（後で使用）
          // Note: MainScreenContextに imageFeatures を追加する必要がある
          // 今回は discussionOrchestrator に直接渡す形で実装

          // 解析完了後、生成フェーズに移行
          actions.setDiscussionPhase("generating");
        } catch (error) {
          // エラーハンドリング（要件: 10.1, 10.2）
          const cardError = handleError(error, {
            context: { phase: "thinking", action: "analyzeImage" },
          });

          // Vision API解析失敗時の謝罪メッセージを生成（要件: 10.1）
          const apologyMessages = createAllApologyMessages(
            evaluators,
            cardError.code,
          );

          // 謝罪メッセージを議論ログに追加
          for (const message of apologyMessages) {
            actions.addDiscussionMessage(message);
          }

          // エラーメッセージを設定
          actions.setError(cardError.toUserMessage());

          // 議論を自然に終了させる（要件: 10.4）
          // 3秒後に初期状態に戻る（要件: 10.5）
          setTimeout(() => {
            actions.reset();
            actions.clearError();
          }, 3000);
        }
      };

      analyzeImage();
    }
  }, [discussionPhase, uploadedImage, actions, evaluators, addToast]);

  /**
   * Generation Phase開始時にカード要素を生成
   * 要件: 3.8, 3.9, 5.1
   */
  useEffect(() => {
    if (discussionPhase === "generating" && uploadedImage) {
      // カード要素生成処理を並行実行
      const generateCardElements = async () => {
        try {
          // 画像をBase64に変換
          const imageBase64 = await fileToBase64(uploadedImage);

          // 画像解析APIを呼び出す（要件: 2.1, 10.6）
          // リトライ機能付きでAPIリクエストを実行
          const { features: imageFeatures } = await retryWithBackoff(
            async () => {
              const analyzeResponse = await fetch("/api/analyze-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageBase64 }),
              });

              if (!analyzeResponse.ok) {
                const errorData = await analyzeResponse.json();
                // HTTPエラーをステータスコード付きでスロー
                const error = new Error(
                  errorData.error || "画像解析に失敗しました",
                ) as Error & { status: number };
                error.status = analyzeResponse.status;
                throw error;
              }

              return analyzeResponse.json();
            },
            {
              onRetry: (attempt, maxRetries) => {
                // リトライ時に警告トーストを表示（要件: 10.6）
                addToast.warning(
                  `接続に失敗しました。リトライ中... (${attempt}/${maxRetries})`,
                  {
                    description: "ネットワーク接続を確認してください。",
                  },
                );
              },
            },
          );

          // 4人の評議員のカード要素生成を並列実行（要件: 3.8, 10.6）
          const generationPromises = evaluators.map(async (evaluator) => {
            // リトライ機能付きでAPIリクエストを実行
            const data = await retryWithBackoff(
              async () => {
                const response = await fetch("/api/generate-card-elements", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    imageFeatures,
                    evaluator,
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  // HTTPエラーをステータスコード付きでスロー
                  const error = new Error(
                    errorData.error || `${evaluator.name}の生成に失敗しました`,
                  ) as Error & { status: number };
                  error.status = response.status;
                  throw error;
                }

                return response.json();
              },
              {
                onRetry: (attempt, maxRetries) => {
                  // リトライ時に警告トーストを表示（要件: 10.6）
                  addToast.warning(
                    `${evaluator.name}の生成に失敗しました。リトライ中... (${attempt}/${maxRetries})`,
                    {
                      description: "ネットワーク接続を確認してください。",
                    },
                  );
                },
              },
            );

            // 評議員の発言を議論ログに追加
            if (data.result?.message) {
              actions.addDiscussionMessage({
                id: `${evaluator.id}-${Date.now()}`,
                evaluatorId: evaluator.id,
                evaluatorName: evaluator.name,
                message: data.result.message,
                timestamp: new Date(),
                type: "discussion",
              });
            }

            return {
              evaluator,
              result: data.result,
            };
          });

          // 全ての生成処理が完了するまで待機
          const generationResults = await Promise.all(generationPromises);

          // 各評議員の生成結果を収集（要件: 3.9）
          const evaluatorResults = new Map();
          for (const { evaluator, result } of generationResults) {
            evaluatorResults.set(evaluator.id, result);
          }

          // カードデータを統合（要件: 5.1）
          const nameResult = generationResults.find(
            (r) => r.evaluator.responsibility === "name",
          )?.result;
          const flavorResult = generationResults.find(
            (r) => r.evaluator.responsibility === "flavor",
          )?.result;
          const attributeResult = generationResults.find(
            (r) => r.evaluator.responsibility === "attribute",
          )?.result;
          const colorRarityResult = generationResults.find(
            (r) => r.evaluator.responsibility === "color-rarity",
          )?.result;

          const cardData = {
            id: `card-${Date.now()}`,
            name: nameResult?.name || "不明なカード",
            attribute: attributeResult?.attribute || "Fire",
            rarity: colorRarityResult?.rarity || "Common",
            effect: `${imageFeatures.objectType}の力を宿す`,
            flavorText: flavorResult?.flavor || "謎に包まれた存在",
            description: imageFeatures.detailedDescription,
            imagePath: "",
            imageData: imageBase64,
            createdAt: new Date(),
            discussionLog: discussionLog,
            skinId: "default",
          };

          // 生成完了後、カードデータを設定
          actions.setGeneratedCard(cardData);

          // 「結果を見る！」ボタンを表示（要件4.16, 11.4, 12.9, 12.10）
          actions.setShowResultButton(true);

          // 完了フェーズに移行
          actions.setDiscussionPhase("complete");
        } catch (error) {
          // エラーハンドリング（要件: 10.2, 10.3）
          const cardError = handleError(error, {
            context: { phase: "generating", action: "generateCardElements" },
          });

          // AI生成失敗時の謝罪メッセージを生成（要件: 10.2）
          const apologyMessages = createAllApologyMessages(
            evaluators,
            cardError.code,
          );

          // 謝罪メッセージを議論ログに追加
          for (const message of apologyMessages) {
            actions.addDiscussionMessage(message);
          }

          // エラーメッセージを設定
          actions.setError(cardError.toUserMessage());

          // 議論を自然に終了させる（要件: 10.4）
          // 3秒後に初期状態に戻る（要件: 10.5）
          setTimeout(() => {
            actions.reset();
            actions.clearError();
          }, 3000);
        }
      };

      generateCardElements();
    }
  }, [
    discussionPhase,
    uploadedImage,
    actions,
    evaluators,
    discussionLog,
    addToast,
  ]);

  /**
   * 画像のアニメーションバリアント
   * - hidden: 非表示状態
   * - visible: 表示状態（中央に配置）
   */
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
  };

  /**
   * 評議員のアニメーションバリアント
   * トコトコ歩くような自然な動きを実装
   *
   * @param index - 評議員のインデックス
   * @returns アニメーションバリアント
   */
  const evaluatorVariants = (index: number) => ({
    idle: {
      x: 0,
      y: index * 120, // 縦に120pxずつ配置
      scale: 0.8,
      opacity: 1,
    },
    moving: {
      x: getCornerPosition(index).x,
      y: getCornerPosition(index).y,
      scale: 1,
      opacity: 1,
      rotate: [0, -2, 2, -2, 2, 0], // 左右に揺れる動き
      transition: {
        type: "spring" as const,
        stiffness: 50,
        damping: 20,
        duration: 1.5,
        rotate: {
          duration: 1.5,
          ease: "easeInOut" as const,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    discussion: {
      x: getCornerPosition(index).x,
      y: getCornerPosition(index).y,
      scale: 1,
      opacity: 1,
      rotate: 0,
    },
  });

  // 画像のプレビューURLを生成
  const imageUrl = uploadedImage ? URL.createObjectURL(uploadedImage) : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 中央の画像エリア */}
      {imageUrl && discussionPhase !== "idle" && (
        <motion.div
          className="relative w-96 h-96 rounded-lg overflow-hidden shadow-2xl"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <Image
            src={imageUrl}
            alt="アップロードされた画像"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      )}

      {/* Opening Dialogue（要件4.8, 4.9, 4.10） */}
      {discussionPhase === "opening" && (
        <OpeningDialogue
          dialogues={allOpeningDialogues}
          onComplete={() => {
            // Opening Dialogue完了後、Thinking Phaseに移行
            actions.setDiscussionPhase("thinking");
          }}
        />
      )}

      {/* 評議員の配置 */}
      {discussionPhase !== "idle" && (
        <div className="absolute inset-0 flex items-center justify-center">
          {evaluators.map((evaluator, index) => (
            <motion.div
              key={evaluator.id}
              className="absolute"
              custom={index}
              variants={evaluatorVariants(index)}
              initial="idle"
              animate={discussionPhase === "moving" ? "moving" : "discussion"}
            >
              {/* 評議員アバター */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                <Image
                  src={evaluator.imagePath}
                  alt={evaluator.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* 評議員名 */}
              <div className="mt-2 px-3 py-1 bg-white rounded-full shadow-md text-center">
                <p className="text-sm font-bold text-gray-800">
                  {evaluator.name}
                </p>
              </div>

              {/* Thinking Phaseアニメーション（要件2.2, 4.11, 4.12） */}
              {discussionPhase === "thinking" && (
                <ThinkingAnimation evaluatorName={evaluator.name} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 吹き出し表示（要件4.14, 4.15） */}
      {discussionPhase === "generating" &&
        evaluators.map((evaluator, index) => {
          // この評議員の最新のメッセージを取得
          const evaluatorMessages = discussionLog.filter(
            (msg) => msg.evaluatorId === evaluator.id,
          );
          const latestMessage = evaluatorMessages[evaluatorMessages.length - 1];

          return (
            <SpeechBubble
              key={evaluator.id}
              message={latestMessage}
              position={getSpeechBubblePosition(index)}
              isVisible={!!latestMessage}
            />
          );
        })}
    </div>
  );
}
