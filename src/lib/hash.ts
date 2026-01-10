import { keccak256 } from 'js-sha3';

export function commitmentHash(candidateId: string, secret: string): string {
  // Solidity: keccak256(abi.encodePacked(candidateId, secret)) ~ keccak(concat(utf8))
  const hex = keccak256(candidateId + secret);
  return '0x' + hex;
}
