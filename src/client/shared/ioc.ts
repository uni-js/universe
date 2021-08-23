import { Container, injectable } from "inversify";

export function bindToContainer(container: Container,classes:any[]){
    for(const cls of classes){
        container.bind(cls).to(cls).inSingletonScope();
    }
}