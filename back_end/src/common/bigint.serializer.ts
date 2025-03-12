
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
import { ClassSerializerInterceptor } from '@nestjs/common';

export class BigIntSerializerInterceptor extends ClassSerializerInterceptor {
  constructor(reflector: Reflector) {
    super(reflector);

    // Patch BigInt to JSON serialization
    BigInt.prototype.toJSON = function() {
      return this.toString();
    };
  }
} 