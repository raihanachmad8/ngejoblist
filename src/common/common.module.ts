import { Global, Module } from '@nestjs/common';
import { CryptoUtil } from './utils/crypto.util';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        CryptoUtil
    ],
    exports: [
        CryptoUtil
    ]
})
export class CommonModule {}
