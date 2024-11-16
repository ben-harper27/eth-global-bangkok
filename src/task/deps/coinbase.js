import { Coinbase } from "@coinbase/coinbase-sdk";

const coinbase = Coinbase.configureFromJson({ filePath: "cdp_api_key.json" });

export default coinbase;
