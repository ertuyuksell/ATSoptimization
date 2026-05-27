package com.cvproje.resume.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    private final AppProperties props;

    public WebClientConfig(AppProperties props) {
        this.props = props;
    }

    @Bean(name = "aiServiceWebClient")
    public WebClient aiServiceWebClient() {
        int timeoutSec = props.getAi().getTimeoutSeconds();
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(timeoutSec, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(timeoutSec, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(props.getAi().getBaseUrl())
                .defaultHeader("X-Internal-Api-Key", props.getAi().getApiKey())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(20 * 1024 * 1024))
                .build();
    }
}
