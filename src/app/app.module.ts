import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {FormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {GameComponent} from "./game/game.component";
import {HomeComponent} from "./home/home.component";
import {MdButtonModule, MdInputModule, MdCardModule, MdDialogModule} from "@angular/material";
import {DataService} from "./data.service";
import {HttpModule} from "@angular/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'game',
        component: GameComponent
    }
];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(routes),
        HttpModule,
        BrowserAnimationsModule,

        MdButtonModule,
        MdInputModule,
        MdCardModule,
        MdDialogModule
    ],
    declarations: [
        AppComponent,
        GameComponent,
        HomeComponent
    ],
    providers: [
        DataService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
