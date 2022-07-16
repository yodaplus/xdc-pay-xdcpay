const Web3 = require("web3");
const namehash = require("eth-ens-namehash");
const multihash = require("multihashes");
const contentHash = require("@ensdomains/content-hash");

const REGISTRAR_MAIN_NET = "0x314159265dd8dbb310642f98f50c066173c1259b";
const REGISTRAR_ROPSTEN = "0x112234455c3a32fd11230c42e7bccd4a84e02010";
const REGISTRAR_APOTHEM = "0x596F02DF7513aaEb8B707971FbA8c35A2F6381E8";

var web3 = new Web3(
  new Web3.providers.HttpProvider("https://rpc-apothem.xinfin.yodaplus.net")
);

var abi = {
  registrar: require("./contracts/registrar.json"),
  resolver: require("./contracts/resolver.json"),
};

module.exports.resolve = function (name) {
  const hash = namehash.hash(name);
  console.log("🚀 ~ file: resolver.js ~ line 20 ~ hash", hash);
  const Registrar = new web3.eth.Contract(abi.registrar, REGISTRAR_APOTHEM);
  console.log("CHECKING INSIDE REGISTRAR");
  return new Promise((resolve, reject) => {
    Registrar.methods
      .resolver(hash)
      .call()
      .then((address) => {
        console.log(
          "🚀 ~ file: resolver.js ~ line 28 ~ .then ~ address",
          address
        );
        if (address === "0x0000000000000000000000000000000000000000") {
          reject(null);
        } else {
          const Resolver = new web3.eth.Contract(abi.resolver, address);
          console.log("REsolver", Resolver.methods.contenthash(hash).call());
          return Resolver.methods.contenthash(hash).call();
        }
      })
      .then((hash) => {
        console.log("Content hash: " + hash);

        if (hash) {
          // Remove 0x prefix

          const hex = hash.substring(2);
          const decodedContentHash = contentHash.decode(hash);
          console.log(
            "🚀 ~ file: resolver.js ~ line 49 ~ .then ~ decodedContentHash",
            decodedContentHash
          );
          // Multihash encode and convert to base58
          resolve(decodedContentHash);
        } else {
          reject("fisk");
        }
      });
  });
};
