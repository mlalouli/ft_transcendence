import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
    UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class RedirectOnLogin implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();
		const url = new URL(process.env.SITE_URL);
		url.port = process.env.FRONTEND_PORT;
		url.pathname = '/Login';
		response.status(status).redirect(url.href);
	}
}