import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, Input, OnChanges, Renderer2, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { RouterModule } from "@angular/router";
import { FavoriteButtonComponent } from "../favorite-button/favorite-button/favorite-button.component";
import { HasRoleDirective } from "../has-role/has-role.directive";
import { UserRole } from "../user/user.service";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    NgOptimizedImage,
    RouterModule,
    HasRoleDirective,
    FavoriteButtonComponent,
  ],
})
export class CardComponent implements OnChanges {
  @Input() listing!: Listing | null;
  @Input() user!: User | null;
  userRole: typeof UserRole = UserRole;

  monthlyRentPriceWithDiscount = signal(0);
  isOperationLoading = signal(true);

  bedroomsMapping: { [k: string]: string } = { "=1": "1 bedroom", other: "# bedrooms" };
  bathroomsMapping: { [k: string]: string } = { "=1": "1 bathroom", other: "# bathrooms" };

  renderer = inject(Renderer2);

  async ngOnChanges() {
    if (this.listing && this.listing.attributes) {
      // this is necessary to reuse the card and card-list components
      const tmp = {
        fees: this.listing.attributes.fees.split("|"),
        photos: this.listing.attributes.photos.split("|"),
        address: this.listing.attributes.address.split("|"),
        ammenities: this.listing.attributes.ammenities.split("|"),
        reviews_stars: this.listing.attributes.reviews_stars,
        slug: this.listing.attributes.slug,
        id: this.listing.id,
      };
      const castedListing = { ...this.listing.attributes } as unknown as Listing;
      castedListing.fees = tmp.fees;
      castedListing.photos = tmp.photos;
      castedListing.address = tmp.address;
      castedListing.ammenities = tmp.ammenities;
      castedListing.reviews_stars = tmp.reviews_stars;
      castedListing.slug = tmp.slug;
      castedListing.id = tmp.id;
      this.listing = castedListing;
    }
    if (this.listing && this.listing.fees && this.listing.fees.length != 0) {
      const discount = parseInt(this.listing.fees[3], 10) * (1 - parseInt(this.listing.fees[4], 10) / 100);
      this.monthlyRentPriceWithDiscount.set(Math.max(0, discount));
    }
  }

  stars(){
    const totalStars = 5
    let response: number[] = []

    const filledStars = this.listing?.reviews_stars;
    if(filledStars){
      response = Array(totalStars)
        .fill(0)
        .map((x, i) => (i < filledStars ? 1 : 0));
      }
    return response
    }



  onImageLoad(event: Event) {
    const target = (event.target as HTMLImageElement).closest(".loading-background") as HTMLDivElement;
    this.renderer.removeClass(target, "loading-background");
    this.isOperationLoading.set(false);
  }
}
