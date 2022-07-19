const namehash = require("eth-ens-namehash");
const multihash = require("multihashes");
const HttpProvider = require("ethjs-provider-http");
const Eth = require("ethjs-query");
const EthContract = require("ethjs-contract");
const registrarAbi = require("./contracts/registrar");
const resolverAbi = require("./contracts/resolver");
const contentHash = require("@ensdomains/content-hash");

function ens(name, provider) {
  console.log("🚀 ~ file: resolver.js ~ line 10 ~ ens ~ name", name);
  console.log("🚀 ~ file: resolver.js ~ line 10 ~ ens ~ provider", provider);
  const eth = new Eth(new HttpProvider(getProvider(provider.type)));
  const hash = namehash.hash(name);
  console.log("🚀 ~ file: resolver.js ~ line 13 ~ ens ~ hash", hash);
  const contract = new EthContract(eth);
  const Registrar = contract(registrarAbi).at(getRegistrar(provider.type));
  return new Promise((resolve, reject) => {
    if (provider.type === "xdc" || provider.type === "xdc_testnet") {
      Registrar.resolver(hash)
        .then((address) => {
          console.log(
            "🚀 ~ file: resolver.js ~ line 21 ~ .then ~ address",
            address
          );
          if (address === "0x0000000000000000000000000000000000000000") {
            reject(null);
          } else {
            const Resolver = contract(resolverAbi).at(address["0"]);
            return Resolver.contenthash(hash);
          }
        })
        .then((contentHashNew) => {
          console.log(
            "🚀 ~ file: resolver.js ~ line 30 ~ .then ~ contentHash",
            contentHashNew
          );
          if (
            contentHashNew["0"] ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ) {
            reject(null);
          }
          if (contentHashNew.ret !== "0x") {
            const hex = contentHashNew["0"].substring(2);
            const decodedContentHash = contentHash.decode(contentHashNew["0"]);
            console.log(
              "🚀 ~ file: resolver.js ~ line 49 ~ .then ~ decodedContentHash",
              decodedContentHash
            );
            resolve(decodedContentHash);
          } else {
            reject(null);
          }
        });
    } else {
      return reject("unsupport");
    }
  });
}

function getProvider(type) {
  switch (type) {
    case "xdc":
      return "https://xdcpayrpc.blocksscan.io/";
    case "xdc_testnet":
      return "https://apothemxdcpayrpc.blocksscan.io/";
    default:
      return "http://localhost:8545/";
  }
}

function getRegistrar(type) {
  switch (type) {
    case "xdc":
      return "0x314159265dd8dbb310642f98f50c066173c1259b";
    case "xdc_testnet":
      return "0x596F02DF7513aaEb8B707971FbA8c35A2F6381E8";
    default:
      return "0x0000000000000000000000000000000000000000";
  }
}

module.exports.resolve = function (name, provider) {
  const path = name.split(".");
  const topLevelDomain = path[path.length - 1];
  if (topLevelDomain === "xdc" || topLevelDomain === "test") {
    return ens(name, provider);
  } else {
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }
};
