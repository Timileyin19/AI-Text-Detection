import "./App.css";
import {
  ChakraProvider,
  Container,
  Center,
  Box,
  Textarea,
  Button,
  Flex,
  Text,
  Alert,
  AlertDescription,
  AlertIcon,
  Stack,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

const App = () => {
  const [text, setText] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState({});

  const checkForAI = () => {
    setLoading(true);
    if (text.length < 50) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      setLoading(false);
      return;
    }
    const trimmedText = text.replace(/\n/g, " ").replace(/\s\s+/g, " "); // replace line breaks (\n) with a single space and multiple spaces (whitespaces) with a single space

    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_EDEN_AI}`,
    };

    const url = "https://api.edenai.run/v2/text/ai_detection";

    const payload = {
      providers: "originalityai, winstonai, sapling",
      text: trimmedText,
      fallback_providers: "",
    };

    axios
      .post(url, payload, { headers: headers })
      .then((response) => {
        processOutput(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const processOutput = (data) => {
    const saplingAiScore = averageAIScore(data.sapling.items);
    const winstonAiScore = averageAIScore(data.winstonai.items);
    const originalityAiScore = averageAIScore(data.originalityai.items);

    const saplingPrediction = checkIfAIorOriginal(data.sapling.items);
    const winstonPrediction = checkIfAIorOriginal(data.winstonai.items);
    const originalityPrediction = checkIfAIorOriginal(data.originalityai.items);

    setOutput({
      sapling: {
        aiScore: saplingAiScore,
        prediction: saplingPrediction,
      },
      winston: {
        aiScore: winstonAiScore,
        prediction: winstonPrediction,
      },
      originality: {
        aiScore: originalityAiScore,
        prediction: originalityPrediction,
      },
    });

    setLoading(false);
  };

  const averageAIScore = (data) => {
    const totalAiScore = data.reduce((acc, item) => acc + item.ai_score, 0);
    const averageAiScore = totalAiScore / data.length;
    return averageAiScore;
  };

  const checkIfAIorOriginal = (data) => {
    let originalCount = 0;
    let aiGeneratedCount = 0;

    data.forEach((item) => {
      if (item.prediction === "original") {
        originalCount++;
      } else if (item.prediction === "ai-generated") {
        aiGeneratedCount++;
      }
    });

    if (originalCount > aiGeneratedCount) {
      return "original";
    } else if (originalCount === aiGeneratedCount) {
      return "equal";
    } else {
      return "ai-generated";
    }
  };

  const processDisplayText = (text) => {
    if (text === "original") {
      return {
        color: "green",
        text: "Original",
      };
    } else if (text === "ai-generated") {
      return {
        color: "red",
        text: "AI Generated",
      };
    } else if (text === "equal") {
      return {
        color: "yellow",
        text: "Equal",
      };
    } else return "";
  };

  return (
    <ChakraProvider resetCSS>
      <Container display="block" textAlign="center">
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Center>
            <Box minWidth="420px">
              <Box marginBottom={5}>
                <Text textAlign="center" fontWeight="bold" fontSize="4xl">
                  AI Detector
                </Text>
              </Box>
              <Box>
                {showAlert && (
                  <Alert status="error" mb={5}>
                    <AlertIcon />
                    <AlertDescription>
                      Please enter at least 50 characters
                    </AlertDescription>
                  </Alert>
                )}
              </Box>
              <Textarea
                size="md"
                resize="none"
                minHeight="300px"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button variant="solid" size="md" mt={4} onClick={checkForAI}>
                {loading ? "Checking..." : "Check for AI"}
              </Button>

              <Stack
                direction={["column", "row"]}
                spacing="24px"
                marginTop={5}
                justifyContent={["center", "space-between"]}
              >
                <Box>
                  <Text>
                    Originality AI:{" "}
                    {output?.originality?.aiScore * 100
                      ? (output?.originality?.aiScore * 100).toFixed(2)
                      : 0}
                    %
                  </Text>
                  <Badge
                    variant="outline"
                    colorScheme={
                      processDisplayText(output?.originality?.prediction)?.color
                    }
                  >
                    {processDisplayText(output?.originality?.prediction)?.text}
                  </Badge>
                </Box>

                <Box>
                  <Text>
                    Sapling:{" "}
                    {output?.sapling?.aiScore * 100
                      ? (output?.sapling?.aiScore * 100).toFixed(2)
                      : 0}
                    %
                  </Text>
                  <Badge
                    variant="outline"
                    colorScheme={
                      processDisplayText(output?.sapling?.prediction)?.color
                    }
                  >
                    {processDisplayText(output?.sapling?.prediction)?.text}
                  </Badge>
                </Box>

                <Box>
                  <Text>
                    Winston AI:{" "}
                    {output?.winston?.aiScore * 100
                      ? (output?.winston?.aiScore * 100).toFixed(2)
                      : 0}
                    %
                  </Text>
                  <Badge
                    variant="outline"
                    colorScheme={
                      processDisplayText(output?.winston?.prediction)?.color
                    }
                  >
                    {processDisplayText(output?.winston?.prediction)?.text}
                  </Badge>
                </Box>
              </Stack>
            </Box>
          </Center>
        </Flex>
      </Container>
    </ChakraProvider>
  );
};

export default App;
